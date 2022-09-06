#!/usr/bin/env node

import { CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager'
// import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'

import { FxBaseConstruct, type FxBaseConstructProps } from '../abstract/fx-base.abstract.construct'
import { FxBaseStack } from '../abstract/fx-base.abstract.stack'

export interface RdsPostgresInstanceProps extends FxBaseConstructProps {
  vpc: ec2.Vpc
  vpcSubnets?: ec2.SubnetSelection
  securityGroups?: ec2.ISecurityGroup[]

  databaseName?: string
  instanceIdentifier?: string

  /**
   * Optional Secrets Manager secret (as json object) specifying `username` and `password` credentials
   * for this RDS instance. A new secret will be generated if none is provided with 'postgres' as the username.
   */
  secret?: secretsManager.ISecret

  instanceType?: ec2.InstanceType
  version?: rds.PostgresEngineVersion
  multiAz?: boolean
  allocatedStorage?: number
  backupRetention?: Duration
  logsRetention?: logs.RetentionDays
  deletionProtection?: boolean
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
  readonly proxy: rds.DatabaseProxy
  readonly parameterGroup: rds.ParameterGroup

  readonly credentials: {
    secret: secretsManager.ISecret
    // ssm: { secretArn: ssm.StringParameter; }
  }

  constructor(parent: FxBaseStack, id: string, props: RdsPostgresInstanceProps) {
    super(parent, id, props)

    const port = 5432
    const databaseName = props.databaseName ?? this.getProjectTag()

    this.credentials = props.secret ? { secret: props.secret } : this.generateDatabaseSecret(port, databaseName)

    const dbEngine = rds.DatabaseInstanceEngine.postgres({
      // RDS proxy does not support v14 yet
      // @see <https://aws.amazon.com/about-aws/whats-new/2022/04/amazon-rds-proxy-supports-postgresql-major-version-13/>
      // version: props.version ?? rds.PostgresEngineVersion.VER_14_3,
      version: props.version ?? rds.PostgresEngineVersion.VER_13_7,
    })

    this.parameterGroup = new rds.ParameterGroup(this, 'ParameterGroup', {
      engine: dbEngine,
      description: '',
      parameters: {
        // ... for example:
        // 'rds.logical_replication': '1',
        // wal_sender_timeout: '0',
        // ...
        // shared_preload_libraries: 'auto_explain,pg_stat_statements,pg_hint_plan,pgaudit',
      },
    })

    this.instance = new rds.DatabaseInstance(this, 'Postgres', {
      vpc: props.vpc,
      vpcSubnets: props.vpcSubnets ?? {
        onePerAz: true,
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: props.securityGroups,
      multiAz: props.multiAz ?? parent.isProduction(),
      // storageType: rds.StorageType...

      deletionProtection: props.deletionProtection,
      removalPolicy: parent.isProduction() ? RemovalPolicy.SNAPSHOT : RemovalPolicy.DESTROY,

      backupRetention: props.backupRetention ?? (parent.isProduction() ? Duration.days(7) : Duration.days(0)),
      deleteAutomatedBackups: !parent.isProduction(),

      // enablePerformanceInsights: true,
      // monitoringInterval: Duration.minutes(1),
      // performanceInsightEncryptionKey: ...
      // performanceInsightRetention: ...

      // cloudwatch logs configuration (note: default logs retention is infinity / never expires)
      cloudwatchLogsExports: parent.isProductionLike() ? ['audit'] : undefined,
      cloudwatchLogsRetention:
        props.logsRetention ?? (parent.isProduction() ? logs.RetentionDays.ONE_MONTH : logs.RetentionDays.ONE_WEEK),

      databaseName,
      instanceIdentifier: props.instanceIdentifier ?? this.getProjectTag(),
      port,
      credentials: rds.Credentials.fromSecret(this.credentials.secret),

      parameterGroup: this.parameterGroup,
      instanceType: props.instanceType ?? ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO), // db.t4g.micro?
      engine: dbEngine,

      autoMinorVersionUpgrade: true,
      allocatedStorage: props.allocatedStorage ?? parent.isProduction() ? undefined : 10, // current default is 100

      // storageEncrypted: true,
      // backupRetention: Duration.days(1),
    })

    this.proxy = this.instance.addProxy('RdsProxy', {
      vpc: props.vpc,
      secrets: [this.credentials.secret],
      debugLogging: parent.isDevelopment(),
      borrowTimeout: Duration.seconds(60),
      securityGroups: props.securityGroups,
    })

    // @future - add option to also build a read replica instance
    // this.readReplica = new rds.DatabaseInstanceReadReplica(this, 'ReadReplica', {
    //   instanceIdentifier: `${this.getProjectTag()}-${this.getDeployStageTag()}-read`,
    //   instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
    //   sourceDatabaseInstance: this.instance,
    //   vpc: props.vpc,
    //   vpcSubnets: {
    //     subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
    //   },
    //   deleteAutomatedBackups: true,
    //   removalPolicy: RemovalPolicy.DESTROY,
    //   deletionProtection: false,
    // })
    // this.readReplica.connections.allowDefaultPortFromAnyIpv4()

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

    // @future - password rotation
    // this.instance.addRotationSingleUser()

    return {
      secret,
      // ssm: { secretArn },
    }
  }

  // @future add cloudwatch metrics + alarms with notification topic
  //
  // private buildCloudWatchResources() {
  //   // create sns resource (aws-sns)
  //   const topic = new sns.Topic(this, 'SnsTopic', {
  //     displayName: 'cdk-rds-postgres-sns',
  //     // topicName: 'cdk-rds-postgres'
  //   })

  //   // subscribe to sns topic (aws-sns-subscriptions)
  //   topic.addSubscription(new subs.EmailSubscription('email@example.com'))

  //   // create rds cloudwatch cpu metric
  //   const cpuMetric = this.instance.metric('CPUUtilization')

  //   // create cpu cloudwatch alarm
  //   const cpuAlarm = new cloudwatch.Alarm(this, 'CpuAlarm', {
  //     evaluationPeriods: 2,
  //     metric: cpuMetric,
  //     threshold: 75,
  //   })

  //   // add rds cpu alarm to sns topic (aws-cloudwatch-actions)
  //   cpuAlarm.addAlarmAction(new cloudwatchActions.SnsAction(topic))

  //   // create rds cloudwatch iopsWrite metric
  //   const iopsMetric = this.instance.metric('WriteIOPS')

  //   // create iops cloudwatch alarm
  //   const iopsAlarm = new cloudwatch.Alarm(this, 'IopsAlarm', {
  //     evaluationPeriods: 2,
  //     metric: iopsMetric,
  //     threshold: 7000,
  //   })

  //   // add rds iops alarm to sns topic
  //   iopsAlarm.addAlarmAction(new cloudwatchActions.SnsAction(topic))
  // }

  private printOutputs(): void {}
}
