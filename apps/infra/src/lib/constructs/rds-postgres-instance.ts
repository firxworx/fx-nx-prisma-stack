#!/usr/bin/env node

import { CfnOutput, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager'

import { FxBaseConstruct, type FxBaseConstructProps } from '../abstract/fx-base.abstract.construct'
import { DatabaseProxy } from 'aws-cdk-lib/aws-rds'

export interface RdsPostgresInstanceProps extends FxBaseConstructProps {
  vpc: ec2.Vpc
  vpcSubnets?: ec2.SubnetSelection
  securityGroups?: ec2.ISecurityGroup[]

  databaseName?: string
  instanceIdentifier?: string

  /**
   * Optional Secrets Manager secret as a json object specifying a `username` and `password` to use as credentials
   * for this RDS instance. A new secret will be generated if none is provided.
   */
  secret?: secretsManager.ISecret

  instanceType?: ec2.InstanceType
  version?: rds.PostgresEngineVersion
  multiAz?: boolean
  allocatedStorage?: number
  backupRetention?: Duration
}

/**
 * Construct to create an RDS Postgres instance with a corresponding RDS connection proxy.
 *
 * The configuration applied by this construct is most suitable for **non-production** deployments.
 *
 * If an `instanceType` is not provided via props, this construct will override CDK defaults and will
 * use a t3.micro instance.
 *
 * Security Groups should have an ingress rule that allows connections on TCP 5432.
 *
 * @see https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.DBInstanceClass.html
 */
export class RdsPostgresInstance extends FxBaseConstruct {
  readonly instance: rds.DatabaseInstance
  readonly proxy: DatabaseProxy
  readonly parameterGroup: rds.ParameterGroup

  readonly credentials: {
    secret: secretsManager.ISecret
    // ssm: { secretArn: ssm.StringParameter; }
  }

  constructor(parent: Stack, id: string, props: RdsPostgresInstanceProps) {
    super(parent, id, props)

    const port = 5432
    const databaseName = props.databaseName ?? this.getProjectTag()

    this.credentials = props.secret ? { secret: props.secret } : this.generateDatabaseSecret(port, databaseName)

    const dbEngine = rds.DatabaseInstanceEngine.postgres({
      version: props.version ?? rds.PostgresEngineVersion.VER_14_3,
    })

    this.parameterGroup = new rds.ParameterGroup(this, 'ParameterGroup', {
      engine: dbEngine,
      description: '',
      parameters: {
        // ... for example:
        // 'rds.logical_replication': '1',
        // wal_sender_timeout: '0',
      },
    })

    this.instance = new rds.DatabaseInstance(this, 'Postgres', {
      vpc: props.vpc,
      vpcSubnets: props.vpcSubnets ?? {
        onePerAz: true,
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: props.securityGroups,
      multiAz: props.multiAz ?? this.isProduction(),

      deletionProtection: false, // this.isProduction(),
      removalPolicy: this.isProduction() ? RemovalPolicy.SNAPSHOT : RemovalPolicy.DESTROY,
      deleteAutomatedBackups: !this.isProduction(),
      backupRetention: props.backupRetention ?? (this.isProduction() ? Duration.days(7) : Duration.days(0)),

      databaseName,
      instanceIdentifier: props.instanceIdentifier ?? this.getProjectTag(),
      port,
      credentials: rds.Credentials.fromSecret(this.credentials.secret),

      parameterGroup: this.parameterGroup,
      instanceType: props.instanceType ?? ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO), // db.t4g.micro?
      engine: dbEngine,

      autoMinorVersionUpgrade: true,
      allocatedStorage: props.allocatedStorage ?? this.isProduction() ? undefined : 10, // current default is 100

      // storageEncrypted: true,
      // backupRetention: Duration.days(1),
    })

    this.proxy = this.instance.addProxy('RdsProxy', {
      vpc: props.vpc,
      secrets: [this.credentials.secret],
      debugLogging: this.isDevelopment(),
      borrowTimeout: Duration.seconds(60),
      securityGroups: props.securityGroups,
    })

    this.printOutputs()
  }

  private generateDatabaseSecret(port?: number, databaseName?: string): typeof this.credentials {
    const secret = new secretsManager.Secret(this, 'RdsSecret', {
      secretName: `${this.getProjectTag()}/${this.getDeployStage()}/db`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'postgres',
          port,
          database: databaseName,
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
      },
    })

    // @future
    // const secretArn = new ssm.StringParameter(this, 'RdsSecretArn', {
    //   parameterName: `${this.getProjectTag()}-${this.getDeployStage()}-rds-secret-arn`,
    //   stringValue: secret.secretArn,
    // })

    return {
      secret,
      // ssm: { secretArn },
    }
  }

  private printOutputs(): void {}
}
