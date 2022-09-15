#!/usr/bin/env node

import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import type { BaseProps } from './types/props.types'
import { DeployStage } from './constants/deploy-stage.enum'
import { CoreStack } from './lib/stacks/core/core.stack'
import { RdsStack } from './lib/stacks/project/data/rds.stack'
import { EcrStack } from './lib/stacks/project/images/ecr.stack'
import { ProjectStack } from './lib/stacks/project/project.stack'
import { EcsStack } from './lib/stacks/core/ecs.stack'

const account = process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT
const region = process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION

const env = { account, region }

const PROJECT_TAG = 'olivia'
const PROJECT_DOMAIN = 'olivia.party' // @todo pull domain name into a config file or env

const getBaseProps = (stage: DeployStage, domain: string): BaseProps => {
  return {
    meta: {
      owner: 'hello@example.com',
      repo: 'firxworx/fx-nx-prisma-stack',
    },
    project: {
      name: 'fx-nx-prisma-stack',
      tag: PROJECT_TAG,
    },
    deploy: {
      stage,
      domain,
      options: {
        useNonProductionDefaults: true,
      },
    },
  }
}

const app = new cdk.App()

const coreStackProd = new CoreStack(app, 'CoreStackProd', {
  env,
  description: `[${PROJECT_TAG}] - Core Infra Stack`,
  ...getBaseProps(DeployStage.DEV, PROJECT_DOMAIN), // @todo PRODUCTION!!
})

const ecrStackProd = new EcrStack(app, 'EcrStackProd', {
  env,
  description: `[${PROJECT_TAG}] - ECR Repo Stack`,
  ...getBaseProps(DeployStage.PRODUCTION, PROJECT_DOMAIN),
})

const ecsStackProd = new EcsStack(app, 'EcsStackProd', {
  env,
  description: `[${PROJECT_TAG}] - ECS Container Stack`,
  vpc: coreStackProd.vpc,
  ...getBaseProps(DeployStage.PRODUCTION, PROJECT_DOMAIN),
})

const rdsStackProd = new RdsStack(app, 'RdsStackProd', {
  env,
  description: `[${PROJECT_TAG}] - RDS Postgres Stack`,
  vpc: coreStackProd.vpc,
  bastion: coreStackProd.bastion,
  ...getBaseProps(DeployStage.PRODUCTION, PROJECT_DOMAIN),
})

const projectStackProd = new ProjectStack(app, 'ProjectStackProd', {
  env,
  description: `[${PROJECT_TAG}] - App/Project Stack`,
  vpc: coreStackProd.vpc,
  cluster: ecsStackProd.cluster,
  database: {
    instance: rdsStackProd.instance,
    proxy: rdsStackProd.proxy,
    credentials: {
      secret: rdsStackProd.credentials.secret,
    },
  },
  api: {
    repositoryName: ecrStackProd.repository.repositoryName,
  },
  ...getBaseProps(DeployStage.PRODUCTION, PROJECT_DOMAIN),
})

// const projectStackDev = new ProjectStack(app, 'ProjectStackDev', {
//   env,
//   vpc: coreStackDev.vpc,
//   ...getBaseProps(DeployStage.DEV, PROJECT_DOMAIN),
// })
