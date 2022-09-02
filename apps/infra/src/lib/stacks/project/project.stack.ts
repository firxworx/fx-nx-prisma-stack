import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'

import * as route53 from 'aws-cdk-lib/aws-route53'

import { FxBaseStack, FxBaseStackProps } from '../../abstract/fx-base.abstract.stack'
import { RdsPostgresInstance } from '../../constructs/rds-postgres-instance'
import { AlbFargateApi } from '../../constructs/alb-fargate-api'
import { StaticUi } from '../../constructs/static-ui'

// import { Route53SubHostedZone } from '../../constructs/route53-sub-hosted-zone'

export interface ProjectStackProps extends FxBaseStackProps {
  vpc: ec2.Vpc
  containerInsights?: boolean

  // api: {
  //   repositoryName: string // ecr.Repository
  // }
}

/**
 * Project stack.
 */
export class ProjectStack extends FxBaseStack {
  // readonly cluster: ecs.Cluster

  // @todo - deploy to projectTag or to apex/parent option

  constructor(scope: Construct, id: string, props: ProjectStackProps) {
    super(scope, id, props)

    // const subdomain = this.isProduction() ? undefined : `${this.getProjectTag()}.${this.getDeployStageTag()}`
    // const uri = `${subdomain ? `${subdomain}.` : ''}${props.deploy.domain}`

    const uri = this.deploy.domain // @temp should be olivia.party

    const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: uri }) // @temp using main zone

    const ui = new StaticUi(this, 'Ui', {
      uri: this.deploy.domain,
    })

    // this.cluster = new ecs.Cluster(this, 'Cluster', {
    //   vpc: props.vpc,
    //   clusterName: `${this.getProjectTag()}-cluster`,
    //   containerInsights: props.containerInsights ?? false,
    // })

    // const postgresInstance = new RdsPostgresInstance(this, 'Db', {
    //   vpc: props.vpc,
    //   databaseName: this.getProjectTag(),
    // })

    // const ecrRepository = ecr.Repository.fromRepositoryName(this, 'Repository', props.api.repositoryName)

    const albCertificate = new acm.DnsValidatedCertificate(this, 'Certificate', {
      domainName: uri,
      hostedZone: zone,
      // region: 'us-east-1', // us-east-1 is required by CloudFront
    })

    // const apiDeployment = new AlbFargateApi(this, 'AlbFargateApi', {
    //   api: {
    //     basePath: `/${this.getProjectTag()}`,
    //     uriVersion: 'v1',
    //   },
    //   cluster: this.cluster,
    //   certificate: albCertificate,
    //   zone,
    //   domainName: uri,
    //   ecrRepository,
    //   ecs: {
    //     container: {
    //       port: 3000,
    //     },
    //   },
    //   ...this.getBaseProps(),
    // })
  }
}
