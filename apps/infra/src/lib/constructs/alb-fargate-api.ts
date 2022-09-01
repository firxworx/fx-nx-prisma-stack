#!/usr/bin/env node

import { CfnOutput, Duration, Stack } from 'aws-cdk-lib'

import * as iam from 'aws-cdk-lib/aws-iam'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns'

import { FxBaseConstruct, FxBaseConstructProps } from '../abstract/fx-base.abstract.construct'

export interface AlbFargateApiProps extends FxBaseConstructProps {
  cluster: ecs.ICluster
  ecrRepository: ecr.IRepository
  ecs: {
    container: {
      environment: Record<string, string>
      secrets: Record<string, ecs.Secret>
      port: number
      executionRole: iam.Role | undefined
    }
    service: {
      securityGroups: ec2.ISecurityGroup[] | undefined
    }
    task: {
      taskRole: iam.Role | undefined
      memoryLimit: ecsPatterns.ApplicationLoadBalancedFargateServiceProps['memoryLimitMiB'] | undefined
      cpuLimit: ecsPatterns.ApplicationLoadBalancedFargateServiceProps['cpu'] | undefined
      desiredCount?: number
    }
    logs: {
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

  constructor(parent: Stack, id: string, props: AlbFargateApiProps) {
    super(parent, id, props)

    this.assertValidProps(props)

    this.albfs = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'ALBFS', {
      serviceName: `${this.getProjectTag()}-api-service-${this.getDeployStageTag()}`,
      cluster: props.cluster,
      // taskSubnets:
      publicLoadBalancer: true,
      assignPublicIp: false,
      // taskDefinition:
      taskImageOptions: {
        containerName: `${this.getProjectTag()}-api-container-${this.getDeployStageTag()}`,
        image: ecs.ContainerImage.fromEcrRepository(props.ecrRepository),
        containerPort: props.ecs.container.port,
        environment: props.ecs.container.environment,
        secrets: props.ecs.container.secrets,
        enableLogging: true,
        logDriver: props.ecs.logs.logDriver,
        taskRole: props.ecs.task.taskRole,
        executionRole: props.ecs.container.executionRole,
      },
      memoryLimitMiB: props.ecs.task.memoryLimit,
      cpu: props.ecs.task.cpuLimit,

      certificate: props.certificate,
      domainZone: props.zone,
      domainName: props.domainName,
      redirectHTTP: true,

      circuitBreaker: { rollback: true },

      deploymentController: {
        type: ecs.DeploymentControllerType.ECS,
      },

      propagateTags: ecs.PropagatedTagSource.SERVICE,
      securityGroups: props.ecs.service.securityGroups,
      desiredCount: props.ecs.task.desiredCount,

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
