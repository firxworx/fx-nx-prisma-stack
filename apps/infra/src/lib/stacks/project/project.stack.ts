import { Construct } from 'constructs'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager'

import * as route53 from 'aws-cdk-lib/aws-route53'

import { FxBaseStack, FxBaseStackProps } from '../../abstract/fx-base.abstract.stack'
import { AlbFargateApi } from '../../constructs/alb-fargate-api'
import { StaticUi } from '../../constructs/static-ui'

// import { Route53SubHostedZone } from '../../constructs/route53-sub-hosted-zone'

export interface ProjectStackProps extends FxBaseStackProps {
  vpc: ec2.Vpc
  cluster: ecs.Cluster
  containerInsights?: boolean
  database: {
    instance: rds.DatabaseInstance
    proxy: rds.DatabaseProxy
    credentials: {
      secret: secretsManager.ISecret
    }
  }

  // deploy props
  api: {
    repositoryName: string // ecr.Repository
  }
}

/**
 * Project stack.
 */
export class ProjectStack extends FxBaseStack {
  // @todo - deploy to projectTag or to apex/parent option

  readonly secrets: Readonly<{
    database: secretsManager.ISecret
  }>

  readonly roles: Readonly<{
    task: iam.Role
    taskExecution: iam.Role
  }>

  readonly securityGroups: Readonly<{
    service: ec2.SecurityGroup
  }>

  readonly api: {
    uri: {
      public: string
      loadBalancer: string
    }
    paths: {
      basePath: string
      version: string
    }
  }

  constructor(scope: Construct, id: string, props: ProjectStackProps) {
    super(scope, id, props)

    this.secrets = {
      database: props.database.credentials.secret,
    }

    // const subdomain = this.isProduction() ? undefined : `${this.getProjectTag()}.${this.getDeployStageTag()}`
    // const uri = `${subdomain ? `${subdomain}.` : ''}${props.deploy.domain}`

    const uri = this.deploy.domain // @temp should be olivia.party

    this.api = {
      uri: {
        public: `${uri}/api`,
        loadBalancer: `${this.getProjectTag()}.api.${uri}`,
      },
      paths: {
        basePath: this.getProjectTag(), // will be appended with '/api' when setting BASE_PATH env var
        version: 'v1',
      },
    }

    const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: uri }) // @temp using main zone

    // const postgresInstance = new RdsPostgresInstance(this, 'Db', {
    //   vpc: props.vpc,
    //   databaseName: this.getProjectTag(),
    // })

    const apiEcrRepository = ecr.Repository.fromRepositoryName(this, 'Repository', props.api.repositoryName)

    const loadBalancerCertificate = new acm.DnsValidatedCertificate(this, 'Certificate', {
      domainName: this.api.uri.loadBalancer,
      hostedZone: zone,
    })

    const { secret } = props.database.credentials

    this.roles = {
      task: this.buildApiTaskRole(),
      taskExecution: this.buildApiTaskExecutionRole(),
    }

    this.securityGroups = {
      service: new ec2.SecurityGroup(this, `ServiceSG`, {
        vpc: props.vpc,
        allowAllOutbound: true,
      }),
    }

    const apiBasePath = `/${this.getProjectTag()}`
    const apiVersion = 'v1'

    const apiDeployment = new AlbFargateApi(this, 'AlbFargateApi', {
      ecrRepository: apiEcrRepository,
      api: {
        basePath: apiBasePath,
        version: 'v1',
      },
      zone,
      domainName: this.api.uri.loadBalancer,
      certificate: loadBalancerCertificate,
      ecs: {
        cluster: props.cluster,
        service: {
          name: `${this.getProjectTag()}-${this.getDeployStageTag()}-api`,
          securityGroups: [this.securityGroups.service],
        },
        task: {
          taskRole: this.roles.task,
        },
        container: {
          name: `${this.getProjectTag()}-${this.getDeployStageTag()}-nestjs`,
          executionRole: this.roles.taskExecution,
          port: 3333,
          environment: {
            DB_NAME: this.getProjectTag(),
            DB_HOST: props.database.instance.dbInstanceEndpointAddress,
            DB_PORT: props.database.instance.dbInstanceEndpointPort,

            // @todo @urgent DATABASE_URL is INSECURE -- do a hack or add .env via Docker to fit
            // lol prisma in parts still ain't ready for production when it gaps like this
            DATABASE_URL: `postgresql://${secret.secretValueFromJson('username').unsafeUnwrap()}:${secret
              .secretValueFromJson('password')
              .unsafeUnwrap()}@${props.database.instance.dbInstanceEndpointAddress}:${
              props.database.instance.dbInstanceEndpointPort
            }/${secret.secretValueFromJson('database').unsafeUnwrap()}`,

            LOG_LEVEL: 'debug',
            API_LOGS_SYNC: 'ON',

            NO_COLOR: '1', // disable console colors because the raw codes clutter cloudwatch logs

            BASE_PATH: `${this.api.paths.basePath}/api`, // 'api',
            API_VERSION: 'v1',

            API_OPT_COMPRESSION: 'ON',
            API_OPT_CSRF_PROTECTION: 'OFF',

            CSRF_TOKEN_COOKIE_NAME: 'CSRF-TOKEN',

            JWT_ACCESS_TOKEN_SECRET: 'jwt_secret_f2rncaww3on', // @todo move to secret parameters
            JWT_REFRESH_TOKEN_SECRET: 'jwt_refresh_secret_vasdla34pand', // @todo move to secret parameters
            JWT_ACCESS_TOKEN_EXPIRATION_TIME: '3306',
            JWT_REFRESH_TOKEN_EXPIRATION_TIME: '604800',
          },
          secrets: {
            DB_USER: ecs.Secret.fromSecretsManager(secret, 'username'),
            DB_PASSWORD: ecs.Secret.fromSecretsManager(secret, 'password'),
          },
        },
      },
      alb: {
        publicLoadBalancer: true,
        assignPublicIp: false,
        targetGroup: {
          // @todo temporary healthcheck while the api's healthcheck isn't implemented :)
          healthcheck: {
            path: `${apiBasePath}/${apiVersion}/videos`,
            healthyHttpCodes: '401',
          },
        },
      },
      ...this.getBaseProps(),
    })

    // configure sg's to allow api to connect to the database
    apiDeployment.albfs.service.connections.allowTo(
      props.database.instance,
      ec2.Port.tcp(props.database.instance.instanceEndpoint.port),
    )

    const ui = new StaticUi(this, 'Ui', {
      uri: this.deploy.domain,
      // api: {
      //   basePath: this.api.paths.basePath,
      // },
    })
  }

  /**
   * Build the task role for the API and attach inline policies to grant required permissions to the
   * application running within the container.
   *
   * @todo ensure all resources tagged
   */
  private buildApiTaskRole(): iam.Role {
    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: `${this.getProjectTag()}-${this.getDeployStageTag()} api task role`,
    })

    taskRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
    )

    // example managed policy to support aws xray:
    // --
    // taskRole.addManagedPolicy({
    //   managedPolicyArn: 'arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess',
    // })

    // attach policies that allow the api to access required AWS services from within the container
    taskRole.attachInlinePolicy(
      new iam.Policy(this, 'SESPolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['SES:*'],
            resources: ['*'],
          }),
        ],
      }),
    )

    // examples for common aws services:
    // --
    // taskRole.addToPolicy(
    //   new iam.PolicyStatement({
    //     resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
    //     actions: ['s3:PutObject'] // ['s3:*']
    //   })
    // );
    // new iam.PolicyStatement({
    //   effect: iam.Effect.ALLOW,
    //   actions: ['sns:Publish'],
    //   resources: ['*'],
    // }),
    // new iam.PolicyStatement({
    //   effect: iam.Effect.ALLOW,
    //   resources: [table.tableArn],
    //   actions: ['dynamodb:*'],
    // }),
    // new iam.PolicyStatement({
    //   effect: iam.Effect.ALLOW,
    //   resources: ['*'],
    //   actions: ['logs:*'],
    // }),

    // examples using the grant* api:
    // --
    // props.queue.grantConsumeMessages(workerDefinition.taskRole);
    // props.table.grantReadWriteData(workerDefinition.taskRole);
    // props.bucket.grantReadWrite(workerDefinition.taskRole);

    return taskRole
  }

  /**
   * Build the task execution role for the API container and attach inline policies that provide the
   * permissions required to start the containers defined in the task, including the necessary Secrets.
   *
   * @see {@link https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html}
   */
  private buildApiTaskExecutionRole(): iam.Role {
    const executionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    })

    executionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
    )

    executionRole.attachInlinePolicy(
      new iam.Policy(this, 'ExecutionPolicy', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'secretsmanager:GetSecretValue',
              'secretsmanager:DescribeSecret',

              // example actions for SSM + KMS:
              // 'ssm:GetParameters',
              // 'kms:Decrypt',

              // example actions for x-ray:
              // 'xray:PutTraceSegments',
              // 'xray:PutTelemetryRecords',
            ],
            resources: [
              this.secrets.database.secretFullArn ?? this.secrets.database.secretArn,

              // example resources for SSM + KMS:
              // 'arn:aws:secretsmanager:<region>:<aws_account_id>:secret:<secret_name>',
              // 'arn:aws:kms:<region>:<aws_account_id>:key/<key_id>',
            ],
          }),
        ],
      }),
    )

    return executionRole
  }
}
