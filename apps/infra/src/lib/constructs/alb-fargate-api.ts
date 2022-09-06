#!/usr/bin/env node

import { CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib'

import * as iam from 'aws-cdk-lib/aws-iam'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns'

import { FxBaseConstruct, FxBaseConstructProps } from '../abstract/fx-base.abstract.construct'
import { FxBaseStack } from '../abstract/fx-base.abstract.stack'

export interface AlbFargateApiProps extends FxBaseConstructProps {
  ecrRepository: ecr.IRepository
  ecs: {
    cluster: ecs.ICluster
    container: {
      name?: string
      environment?: Record<string, string>
      secrets?: Record<string, ecs.Secret>
      port: number
      executionRole?: iam.Role
    }
    service?: {
      name?: string
      securityGroups?: ec2.ISecurityGroup[]
    }
    task?: {
      taskRole?: iam.Role
      memoryLimit?: ecsPatterns.ApplicationLoadBalancedFargateServiceProps['memoryLimitMiB']
      cpuLimit?: ecsPatterns.ApplicationLoadBalancedFargateServiceProps['cpu']
      desiredCount?: number
      minHealthyPercent?: number
      maxHealthyPercent?: number
    }
    logs?: {
      logDriver: ecs.LogDriver
    }
    scaling?: {
      taskCpuThreshold?: {
        percent: number
        scaleInCooldown?: Duration
        scaleOutCooldown?: Duration
      }
      taskCapacity?: {
        min: number
        max: number
      }
    }
  }

  alb: {
    publicLoadBalancer: boolean
    assignPublicIp: boolean

    targetGroup?: {
      healthcheck?: {
        path: string
        healthyHttpCodes: string
      }
    }
  }

  api: {
    /**
     * Base path of the API per project convention (e.g. `/{PROJECT_TAG}/api`) that forms part of the complete
     * API URI that the containerized API is listenening at (`{BASE_PATH}/{VERSION}` e.g. `project-tag/api/v1`)
     * and associate with the containerized API running on Fargate.
     */
    basePath: string

    /**
     * API version prefixed with a 'v' e.g. 'v1', 'v2', etc that forms part of the complete API URI
     * (`{BASE_PATH}/{VERSION}` e.g. `project-tag/api/v1`).
     */
    version: string
  }

  zone: route53.IHostedZone
  certificate: acm.ICertificate
  domainName: string
}

/**
 * Construct to launch a containerized API as an AWS Fargate service behind an Application Load Balancer (ALB).
 *
 * The API must be configured to adhere to project convention
 */
export class AlbFargateApi extends FxBaseConstruct {
  readonly albfs: ecsPatterns.ApplicationLoadBalancedFargateService

  readonly scaling: {
    taskCount: ecs.ScalableTaskCount
  }

  constructor(parent: FxBaseStack, id: string, props: AlbFargateApiProps) {
    super(parent, id, props)

    this.assertValidProps(props)

    // reminder: be careful about modifying albfs values on production deployments to avoid hangs
    this.albfs = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'ALBFS', {
      serviceName: props.ecs.service?.name ?? `${parent.getProjectTag()}-${parent.getDeployStageTag()}`,
      cluster: props.ecs.cluster,
      securityGroups: props.ecs.service?.securityGroups,

      publicLoadBalancer: props.alb.publicLoadBalancer,
      assignPublicIp: props.alb.assignPublicIp,
      // taskSubnets: ... // @future could make private alb and put http-api up front w/ vpclink (for low-mid scale w/ private alb)

      // taskDefinition: ... // alternative to specifying taskImageOptions is to define them separately
      taskImageOptions: {
        containerName: props.ecs.container.name ?? `${parent.getProjectTag()}-${parent.getDeployStageTag()}-api`,
        image: ecs.ContainerImage.fromEcrRepository(props.ecrRepository),
        containerPort: props.ecs.container.port,

        environment: props.ecs.container.environment,
        secrets: props.ecs.container.secrets,

        enableLogging: true,
        logDriver:
          props.ecs.logs?.logDriver ??
          ecs.LogDriver.awsLogs({
            streamPrefix: `${parent.getProjectTag()}-${parent.getDeployStageTag()}`,
            logGroup: new logs.LogGroup(this, 'LogGroup', {
              logGroupName: `/aws/ecs/${parent.getProjectTag()}/api/${parent.getDeployStageTag()}`,
              retention: parent.isProduction() ? logs.RetentionDays.ONE_YEAR : logs.RetentionDays.THREE_DAYS,
              removalPolicy: RemovalPolicy.DESTROY,
            }),
          }),

        taskRole: props.ecs.task?.taskRole,
        executionRole: props.ecs.container.executionRole,
      },
      memoryLimitMiB: props.ecs.task?.memoryLimit ?? 512,
      cpu: props.ecs.task?.cpuLimit ?? 256,

      certificate: props.certificate,
      domainZone: props.zone,
      domainName: props.domainName,
      redirectHTTP: true,

      circuitBreaker: parent.isProduction() ? { rollback: true } : undefined,

      deploymentController: {
        type: ecs.DeploymentControllerType.ECS,
      },

      propagateTags: ecs.PropagatedTagSource.SERVICE,

      desiredCount: props.ecs.task?.desiredCount,
      minHealthyPercent: props.ecs.task?.minHealthyPercent ?? 50,
      maxHealthyPercent: props.ecs.task?.maxHealthyPercent ?? 200,
    })

    this.scaling = {
      taskCount: this.albfs.service.autoScaleTaskCount({
        minCapacity: props.ecs.scaling?.taskCapacity?.min ?? 1,
        maxCapacity: props.ecs.scaling?.taskCapacity?.max ?? 2,
      }),
    }

    this.scaling.taskCount.scaleOnCpuUtilization('TaskCpuScaling', {
      targetUtilizationPercent: props.ecs.scaling?.taskCpuThreshold?.percent ?? 70,
      scaleInCooldown: props.ecs.scaling?.taskCpuThreshold?.scaleInCooldown ?? Duration.seconds(120),
      scaleOutCooldown: props.ecs.scaling?.taskCpuThreshold?.scaleOutCooldown ?? Duration.seconds(120),
    })

    // EC2 Target groups
    if (props.alb.targetGroup?.healthcheck) {
      this.albfs.targetGroup.configureHealthCheck({
        path: props.alb.targetGroup?.healthcheck.path, // `${props.api.basePath}/${props.api.version}`, // leading slash required
        healthyHttpCodes: props.alb.targetGroup?.healthcheck.healthyHttpCodes, // '200-299',
      })
    }

    this.printOutputs()
  }

  private printOutputs(): void {
    // example output value: Example-Name-FJCO5F8777ZK-1492138584.ca-central-1.elb.amazonaws.com
    new CfnOutput(this, 'ApplicationLoadBalancerDnsName', {
      value: this.albfs.loadBalancer.loadBalancerDnsName,
    })
  }

  private assertValidProps(props: AlbFargateApiProps): true {
    const errorPrefix = 'Validation Error:'

    if (props.api.basePath.slice(0, 1) !== '/') {
      throw new Error(
        `${errorPrefix} API basePath value must have a leading forward slash. Received: '${props.api.basePath}'`,
      )
    }

    if (!/v\d+/.test(props.api.version)) {
      throw new Error(
        `${errorPrefix} API version value must match /v\d+/ e.g. 'v1', 'v2', etc. Received: '${props.api.version}'`,
      )
    }

    return true
  }
}
