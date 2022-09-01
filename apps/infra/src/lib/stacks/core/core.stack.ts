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
 */
export class CoreStack extends FxBaseStack {
  readonly vpc: ec2.Vpc

  readonly roles: Record<'ec2', iam.Role>

  constructor(scope: Construct, id: string, props: CoreStackProps) {
    super(scope, id, props)

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      cidr: '10.0.0.0/16',
      maxAzs: props.maxAzs ?? 2,
      natGateways: props.natGateways ?? (this.isProduction() ? 2 : 1),
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        ...this.generateSubnetConfigurations(1, 'active', ec2.SubnetType.PUBLIC, 24),
        ...this.generateSubnetConfigurations(2, 'reserved', ec2.SubnetType.PUBLIC, 24),
        ...this.generateSubnetConfigurations(1, 'active', ec2.SubnetType.PRIVATE_WITH_NAT, 24),
        ...this.generateSubnetConfigurations(2, 'reserved', ec2.SubnetType.PRIVATE_WITH_NAT, 24),
        ...this.generateSubnetConfigurations(1, 'active', ec2.SubnetType.PRIVATE_ISOLATED, 24),
        ...this.generateSubnetConfigurations(2, 'reserved', ec2.SubnetType.PRIVATE_ISOLATED, 24),
      ],
      natGatewayProvider: this.isProduction()
        ? ec2.NatProvider.gateway()
        : ec2.NatProvider.instance({
            // new ec2.InstanceType('t2.micro'),
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.NANO),
          }),
      gatewayEndpoints: {
        // enable containers to pull image layers without using the nat gateway
        S3: { service: ec2.GatewayVpcEndpointAwsService.S3 },
      },
    })

    this.vpc.addInterfaceEndpoint('EcrDockerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
    })

    this.vpc.addInterfaceEndpoint('EcrApiEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR,
    })

    this.vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
    })

    /*
    consider other potentially useful services to access via VPC interface endpoints:
    @see <https://docs.aws.amazon.com/AmazonECR/latest/userguide/vpc-endpoints.html>

    ec2.InterfaceVpcEndpointAwsService.EC2
    ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH
    ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS
    ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_EVENTS
    ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER
    ec2.InterfaceVpcEndpointAwsService.LAMBDA
    */

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

    this.printOutputs()
  }

  private printOutputs() {
    new cdk.CfnOutput(this, 'VPCId', {
      value: this.vpc.vpcId,
      description: `VPC ID - ${this.getProjectTag()}`,
      exportName: `${this.getProjectTag()}CoreStack:vpcId`,
    })
  }

  private generateSubnetConfigurations(
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
