#!/usr/bin/env node

import * as path from 'path'
import { CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib'

import * as iam from 'aws-cdk-lib/aws-iam'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins'
import { FxBaseConstruct, FxBaseConstructProps } from '../abstract/fx-base.abstract.construct'
import { FxBaseStack } from '../abstract/fx-base.abstract.stack'
import { EdgeRewriteProxy } from './edge-lambda/edge-rewrite-proxy'

export interface StaticUiProps extends FxBaseConstructProps {
  // /**
  //  * Provide the URI details for the TLS certificate and CloudFront to host the client UI at.
  //  * If the `subdomain` prop is not provided, the deployment is assumed to be for the apex domain.
  //  */
  // uri: {
  //   subdomain?: string
  //   domain: string
  // }

  uri: string

  /**
   * Optionally configure CloudFront to reverse-proxy requests to the /api/* path to the back-end
   * API at the specified uri.
   */
  api?: {
    /**
     * Base path of the API at the target e.g. load balancer.
     *
     * The given value must have a leading slash. The project convention is to use `/{PROJECT_TAG}`.
     *
     * This value is used to set the CloudFront originPath for the 'api/*' route such that the target will
     * receive forwarded requests for public-facing /api route as `{basePath}/api/*`.
     *
     * The convention of using a base path in this way supports sharing a load balancer across multiple projects
     * where per convention each project has a unique project tag.
     *
     * The CloudFront default originPath is '/'.
     */
    basePath?: string
  }

  options?: {
    /**
     * Configure deployment as a single-page-app (SPA).
     * When `true`, errors are redirected back to `index.html`.
     *
     * This configuration generally option suits UI's bootstrapped via create-react-app (CRA).
     *
     * The default is `false` which is ideal for NextJS static site exports where NextJS is
     * configured with `trailingSlash: true` and the project implements dedicated error pages.
     */
    isSinglePageApp?: boolean
    disableCloudFrontCacheInDevelopment?: boolean
    cloudFront?: {
      priceClass?: cloudfront.PriceClass
    }
  }
}

/**
 * Static webapp UI infrastructure that stores assets on S3 and leverages CloudFront as a CDN.
 * TLS (SSL) is provided via ACM.
 *
 * This construct creates a private site assets bucket that CloudFront accesses via OIA.
 * By design the bucket is not configured as a static website hosting bucket as this is now a legacy approach.
 *
 * The configuration is intended for compatibility with NestJS' static build/export option.
 */
export class StaticUi extends FxBaseConstruct {
  readonly buckets: {
    assets: s3.Bucket
    logs: s3.Bucket
  }

  readonly uri: string

  readonly api:
    | {
        uri: string
      }
    | undefined

  // readonly urls: {
  //   ui: string
  //   api: string
  // }

  readonly certificate: acm.ICertificate
  readonly zone: route53.IHostedZone
  readonly record: route53.ARecord

  readonly deployment: s3Deployment.BucketDeployment

  readonly cloudfront: {
    oai: cloudfront.OriginAccessIdentity
    distribution: cloudfront.Distribution
  }

  // readonly originRequestPolicy: cloudfront.OriginRequestPolicy

  constructor(parent: FxBaseStack, id: string, props: StaticUiProps) {
    super(parent, id, props)

    this.uri = props.uri // @temp props.uri.subdomain ? `${props.uri.subdomain}.${props.uri.domain}` : props.uri.domain
    this.api = props.api
      ? {
          uri: `${this.uri}${props.api.basePath}/api`,
        }
      : undefined

    // @todo establish convention of project tag
    this.zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: props.uri })

    // there is an updated means for cloudfront+s3 - origin access control however it is not supported in cdk yet
    // @see https://github.com/aws/aws-cdk/issues/21771
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'CloudFrontOAI', {
      comment: `[${this.getProjectTag()}]-${this.getDeployStageTag()} ORI for ${this.uri}`,
    })

    // s3 bucket for site assets - note the bucket name should match uri in s3 hosting scenarios
    const assetsBucket = new s3.Bucket(this, 'AssetsBucket', {
      bucketName: this.uri,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: parent.isProduction() ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: !parent.isProduction(),

      // to enable bucket versioning for production --
      // versioned: parent.isProduction(),
    })

    const logsBucket = new s3.Bucket(this, 'LogsBucket', {
      accessControl: s3.BucketAccessControl.PRIVATE,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: parent.isProduction() ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: !parent.isProduction(),
    })

    this.buckets = {
      assets: assetsBucket,
      logs: logsBucket,
    }

    // this.buckets.assets.grantRead(cloudfrontOAI.grantPrincipal)
    const cloudfrontPolicyStatement = new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [assetsBucket.arnForObjects('*')],
      principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)], // [cloudfrontOAI.grantPrincipal]
    })

    this.buckets.assets.addToResourcePolicy(cloudfrontPolicyStatement)

    const httpsOnlyPolicyStatement = new iam.PolicyStatement({
      sid: 'HttpsOnly',
      resources: [`${this.buckets.assets.bucketArn}/*`],
      actions: ['*'],
      principals: [new iam.AnyPrincipal()],
      effect: iam.Effect.DENY,
      conditions: {
        Bool: {
          'aws:SecureTransport': 'false',
        },
      },
    })

    this.buckets.assets.addToResourcePolicy(httpsOnlyPolicyStatement)

    this.certificate = new acm.DnsValidatedCertificate(this, 'Certificate', {
      domainName: this.uri,
      hostedZone: this.zone,
      region: 'us-east-1', // CloudFront requires us-east-1 region
    })

    const rewriteProxyEdgeLambda = new EdgeRewriteProxy(parent, 'EdgeRewrite', {})

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      // warning: do not set defaultRootObject when using the rewrite proxy edge lambda and/or /api/* behaviors
      // warning: be careful setting a defaultBehavior.originRequestPolicy as it can cause signatures to not match vs s3

      certificate: this.certificate,
      domainNames: [this.uri],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      priceClass: props.options?.cloudFront?.priceClass ?? cloudfront.PriceClass.PRICE_CLASS_100, // 100 = US, CA, EU, IS

      enableLogging: true,
      logIncludesCookies: true,
      // logBucket: this.buckets.logs,
      // logFilePrefix: `${this.getProjectTag()}-${this.getDeployStageTag()}-edge/`,

      defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(assetsBucket, { originAccessIdentity: cloudfrontOAI }),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS, // vs. HTTPS_ONLY
        cachePolicy:
          parent.isDevelopment() && !props.options?.disableCloudFrontCacheInDevelopment
            ? cloudfront.CachePolicy.CACHING_DISABLED
            : cloudfront.CachePolicy.CACHING_OPTIMIZED,
        edgeLambdas: [
          {
            functionVersion: rewriteProxyEdgeLambda.lambda.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
          },
        ],
      },

      // conditionally include additional behaviors for `api/*` route that forwards requests to back-end api
      ...(!!props.api ? { additionalBehaviors: this.getDistributionAdditionalBehaviorsForApi() } : {}),

      // redirect unknown routes back to index.html if configuration is for an SPA
      ...(!!props.options?.isSinglePageApp
        ? {
            errorResponses: [403, 404].map((httpStatus) => ({
              httpStatus,
              responseHttpStatus: 200,
              responsePagePath: '/index.html',
              ttl: Duration.minutes(5),
            })),
          }
        : {
            errorResponses: [404, 500].map((httpStatus) => ({
              httpStatus,
              responseHttpStatus: httpStatus,
              responsePagePath: `/${httpStatus}/index.html`,
              ttl: Duration.minutes(5),
            })),
          }),
    })

    // this.buckets.logs.grantPutAcl(...)

    this.cloudfront = {
      oai: cloudfrontOAI,
      distribution,
    }

    this.record = new route53.ARecord(this, 'DnsAliasRecord', {
      zone: this.zone,
      recordName: this.uri,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.cloudfront.distribution)),
    })

    this.deployment = new s3Deployment.BucketDeployment(this, 'S3DeployWithInvalidation', {
      sources: [s3Deployment.Source.asset(path.join(process.cwd(), 'dist/apps/ui/exported'))],
      destinationBucket: this.buckets.assets,
      distribution: this.cloudfront.distribution,
      distributionPaths: ['/*'],

      // @see https://github.com/aws/aws-cdk/tree/main/packages/%40aws-cdk/aws-s3-deployment#retain-on-delete
      retainOnDelete: !parent.isProduction(),
    })

    this.printOutputs()
  }

  private printOutputs(): void {
    new CfnOutput(this, 'DeployUrl', { value: `https://${this.uri}` })
    new CfnOutput(this, 'S3AssetsBucket', { value: this.buckets.assets.bucketName })
    new CfnOutput(this, 'S3LogsBucket', { value: this.buckets.logs.bucketName })
    new CfnOutput(this, 'CertificateArn', { value: this.certificate.certificateArn })
    new CfnOutput(this, 'CloudFrontDistributionId', { value: this.cloudfront.distribution.distributionId })
  }

  private getDistributionAdditionalBehaviorsForApi() {
    if (!this.api || !this.api.uri) {
      throw new Error(
        'Precondition failed: getDistributionAdditionalBehaviorsForApi() requires a valid api prop to be defined',
      )
    }

    return {
      'api/*': {
        // `${httpApi.httpApiId}.execute-api.${this.region}.${this.urlSuffix}`
        origin: new cloudfrontOrigins.HttpOrigin(this.api.uri, {
          // ALB will receive requests at path /{projectTag}/api/*
          originPath: `/${this.getProjectTag()}`,
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          httpsPort: 443,
          // @todo for security - customHeaders: ... (secret header to identify requests from cloudfront)
          // keepAliveTimeout
        }),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER, // include all query strings, headers, etc
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED, // do not cache api paths w/ cloudfront

        // examples of more specific cache + origin request policies:
        //
        // cachePolicy: new cloudfront.CachePolicy(this, 'CachePolicy', {
        //   headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Authorization'),
        // }),
        //
        // originRequestPolicy: new cloudfront.OriginRequestPolicy(this, 'OriginRequestPolicy', {
        //   cookieBehavior: cloudfront.OriginRequestCookieBehavior.allowList(
        //     'CloudFront-Policy',
        //     'CloudFront-Key-Pair-Id',
        //     'CloudFront-Signature',
        //   ),
        // }),
      },
    }
  }
}
