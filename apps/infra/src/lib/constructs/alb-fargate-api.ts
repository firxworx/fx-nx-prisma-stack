#!/usr/bin/env node

import { CfnOutput, Duration } from 'aws-cdk-lib'

import * as iam from 'aws-cdk-lib/aws-iam'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns'

import { FxBaseConstruct, FxBaseConstructProps } from '../abstract/fx-base.abstract.construct'
import { FxBaseStack } from '../abstract/fx-base.abstract.stack'

export interface AlbFargateApiProps extends FxBaseConstructProps {
  cluster: ecs.ICluster
  ecrRepository: ecr.IRepository
  ecs: {
    container: {
      environment?: Record<string, string>
      secrets?: Record<string, ecs.Secret>
      port: number
      executionRole?: iam.Role
    }
    service?: {
      securityGroups?: ec2.ISecurityGroup[]
    }
    task?: {
      taskRole?: iam.Role
      memoryLimit?: ecsPatterns.ApplicationLoadBalancedFargateServiceProps['memoryLimitMiB']
      cpuLimit?: ecsPatterns.ApplicationLoadBalancedFargateServiceProps['cpu']
      desiredCount?: number
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

  api: {
    basePath: string
    uriVersion: string
  }

  zone: route53.IHostedZone
  certificate: acm.ICertificate
  domainName: string
}

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
      serviceName: `${parent.getProjectTag()}-${parent.getDeployStageTag()}`,
      cluster: props.cluster,
      publicLoadBalancer: true,
      assignPublicIp: false,
      // taskSubnets: ...
      // taskDefinition: ... // alternative to specifying taskImageOptions
      taskImageOptions: {
        containerName: `${parent.getProjectTag()}-${parent.getDeployStageTag()}-api`,
        image: ecs.ContainerImage.fromEcrRepository(props.ecrRepository),
        containerPort: props.ecs.container.port,
        environment: props.ecs.container.environment,
        secrets: props.ecs.container.secrets,
        enableLogging: true,
        logDriver: props.ecs.logs?.logDriver,
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
      securityGroups: props.ecs.service?.securityGroups,
      desiredCount: props.ecs.task?.desiredCount,

      // maxHealthyPercent: 200,
      // minHealthyPercent: 50,
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

    this.albfs.targetGroup.configureHealthCheck({
      path: `${props.api.basePath}/${props.api.uriVersion}`, // leading slash required
      healthyHttpCodes: '200-299',
    })

    this.printOutputs()
  }

  private printOutputs(): void {
    // example output value: Example-Name-FJCO5F8777ZK-1492138584.ca-central-1.elb.amazonaws.com
    new CfnOutput(this, 'ApplicationLoadBalancerDnsName', {
      value: this.albfs.loadBalancer.loadBalancerDnsName,
    })
  }

  private assertValidProps(props: AlbFargateApiProps): true {
    if (props.api.basePath.slice(0, 1) !== '/') {
      throw new Error(`API basePath value must have a leading forward slash. Received: '${props.api.basePath}'`)
    }
    return true
  }
}
