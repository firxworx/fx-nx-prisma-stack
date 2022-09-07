import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as iam from 'aws-cdk-lib/aws-iam'

import { FxBaseStack, type FxBaseStackProps } from '../../abstract/fx-base.abstract.stack'

export interface CoreStackProps extends FxBaseStackProps {
  maxAzs?: number
  natGateways?: number
  natGatewayProvider?: ec2.NatProvider
}

/**
 * Core (base) infrastructure stack including a VPC.
 *
 * The default configuration uses NAT instances vs. NAT gateways in non-production stages.
 *
 * @see {@link https://aws.amazon.com/blogs/architecture/choosing-your-vpc-endpoint-strategy-for-amazon-s3/}
 */
export class CoreStack extends FxBaseStack {
  readonly vpc: ec2.Vpc
  readonly roles: Record<'ec2', iam.Role>

  readonly gatewayEndpoints?: Partial<Record<keyof typeof ec2.GatewayVpcEndpointAwsService, ec2.GatewayVpcEndpoint>>
  readonly interfaceEndpoints?: Partial<
    Record<keyof typeof ec2.InterfaceVpcEndpointAwsService, ec2.InterfaceVpcEndpoint>
  >

  readonly bastion: {
    securityGroup: ec2.SecurityGroup
    instance: ec2.BastionHostLinux
  }

  constructor(scope: Construct, id: string, props: CoreStackProps) {
    super(scope, id, props)

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      cidr: '10.0.0.0/16',
      maxAzs: props.maxAzs ?? 2,
      natGateways: props.natGateways ?? (this.isProduction() ? 2 : 1),
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        ...this.buildSubnetConfigurations(1, 'active', ec2.SubnetType.PUBLIC, 24),
        ...this.buildSubnetConfigurations(2, 'reserved', ec2.SubnetType.PUBLIC, 24),
        ...this.buildSubnetConfigurations(1, 'active', ec2.SubnetType.PRIVATE_WITH_NAT, 24),
        ...this.buildSubnetConfigurations(2, 'reserved', ec2.SubnetType.PRIVATE_WITH_NAT, 24),
        ...this.buildSubnetConfigurations(1, 'active', ec2.SubnetType.PRIVATE_ISOLATED, 24),
        ...this.buildSubnetConfigurations(2, 'reserved', ec2.SubnetType.PRIVATE_ISOLATED, 24),
      ],
      natGatewayProvider: this.isProduction()
        ? ec2.NatProvider.gateway()
        : ec2.NatProvider.instance({
            // current nat gateway ami requires 'x86_64' architecture
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3A, ec2.InstanceSize.NANO),
          }),
    })

    // S3 gw endpoints enable containers to pull assets e.g. image layers w/o consuming nat gateway resources
    this.gatewayEndpoints = {
      S3: this.vpc.addGatewayEndpoint('S3', {
        service: ec2.GatewayVpcEndpointAwsService.S3,
      }),
    }

    // consider other services to access via AWS PrivateLink / endpoint services
    // e.g. EC2, CLOUDWATCH, CLOUDWATCH_LOGS, CLOUDWATCH_EVENTS, SECRETS_MANAGER, LAMBDA
    //
    // note interface endpoints are subject to both nominal hourly + bandwidth charges
    // @see <https://docs.aws.amazon.com/AmazonECR/latest/userguide/vpc-endpoints.html>

    if (this.isProduction()) {
      this.interfaceEndpoints = {
        ECR_DOCKER: this.vpc.addInterfaceEndpoint('EcrDockerEndpoint', {
          service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
        }),
        ECR: this.vpc.addInterfaceEndpoint('EcrDockerEndpoint', {
          service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
        }),
        SECRETS_MANAGER: this.vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
          service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
        }),
      }
    }

    this.roles = {
      ec2: new iam.Role(this, 'Ec2Role', {
        assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
          iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
        ],
        description: 'Allow EC2 instances to call AWS services on your behalf + support CloudWatch agent',
      }),
    }

    const bastionSecurityGroup = new ec2.SecurityGroup(this, 'BastionSecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: true,
    })

    // warning:
    // do not store data on bastion because the latestAmazonLinux machine image will
    // replace the bastion image when a new one becomes available
    const bastionInstance = new ec2.BastionHostLinux(this, 'Bastion', {
      vpc: this.vpc,
      instanceName: `${this.getProjectTag()}-${this.getDeployStageTag()}-bastion`,
      securityGroup: bastionSecurityGroup,
      subnetSelection: { subnetType: ec2.SubnetType.PUBLIC },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3A, ec2.InstanceSize.NANO),
      machineImage: ec2.MachineImage.latestAmazonLinux({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 }),
      // init:
    })

    // sudo yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm

    this.bastion = {
      securityGroup: bastionSecurityGroup,
      instance: bastionInstance,
    }

    bastionSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.icmpPing(), 'allow ping')
    bastionSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow ssh connections from any ipv4')

    this.printOutputs()
  }

  private printOutputs() {
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: `[${this.getProjectTag()}] [${this.getDeployStageTag()}] VPC ID`,
      exportName: `${this.getProjectTag()}:${this.getDeployStageTag()}:${this.stackName}:vpcId`,
    })
  }

  private buildSubnetConfigurations(
    count: number,
    status: 'active' | 'reserved',
    subnetType: ec2.SubnetType,
    cidrMask: number,
  ): ec2.SubnetConfiguration[] {
    const namePrefixDict: Record<ec2.SubnetType, string> = {
      [ec2.SubnetType.PUBLIC]: 'Public',
      [ec2.SubnetType.PRIVATE_WITH_NAT]: 'Private',
      [ec2.SubnetType.PRIVATE_ISOLATED]: 'Isolated',
    }

    return Array.from({ length: count }, (_, i) => i).map((i) => {
      return {
        name: `${namePrefixDict[subnetType]}${i}`,
        cidrMask,
        subnetType,
        reserved: status === 'reserved',
      }
    })
  }
}
