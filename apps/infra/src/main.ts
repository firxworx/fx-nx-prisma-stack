#!/usr/bin/env node

import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { InfraStack } from './lib/infra-stack'
import { ProjectStack } from './lib/stacks/project.stack'
import type { BaseProps } from './types/props.types'
import { DeployStage } from './constants/deploy-stage.enum'
import { CoreStack } from './lib/stacks/core/core.stack'

const account = process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT
const region = process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION

const env = { account, region }

const partialBaseProps: Pick<BaseProps, 'meta' | 'project'> = {
  meta: {
    owner: 'hello@example.com',
    repo: 'firxworx/fx-nx-prisma-stack',
  },
  project: {
    name: 'fx-nx-prisma-stack',
    tag: 'excelsior',
  },
}

const buildBaseProps = (stage: DeployStage, domain: string): BaseProps => {
  return {
    ...partialBaseProps,
    deploy: {
      stage,
      domain,
    },
  }
}

const app = new cdk.App()
new InfraStack(app, 'InfraStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
})

const coreStackDev = new CoreStack(app, 'CoreStackDev', {
  env,
  ...buildBaseProps(DeployStage.DEV, 'example.com'),
})

const projectStackDev = new ProjectStack(app, 'ProjectStackDev', {
  env,
  vpc: coreStackDev.vpc,
  ...buildBaseProps(DeployStage.DEV, 'example.com'),
})
