import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager'

import { FxBaseStack, type FxBaseStackProps } from '../../../abstract/fx-base.abstract.stack'
import { RdsPostgresInstance } from '../../../constructs/rds-postgres-instance'

export interface RdsStackProps extends FxBaseStackProps {
  vpc: ec2.Vpc
}

export class RdsStack extends FxBaseStack {
  readonly instance: rds.DatabaseInstance
  readonly proxy: rds.DatabaseProxy
  readonly parameterGroup: rds.ParameterGroup

  readonly credentials: {
    secret: secretsManager.ISecret
    // ssm: { secretArn: ssm.StringParameter; }
  }

  constructor(scope: Construct, id: string, props: RdsStackProps) {
    super(scope, id, props)
    const { vpc } = props

    const rdsPostgresInstance = new RdsPostgresInstance(this, 'Db', {
      vpc,
    })

    const { instance, proxy, parameterGroup, credentials } = rdsPostgresInstance

    this.instance = instance
    this.proxy = proxy
    this.parameterGroup = parameterGroup
    this.credentials = credentials
  }
}
