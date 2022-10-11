import { Module } from '@nestjs/common'

import { AwsSesService } from './aws-ses.service'
import { AwsS3BucketsService } from './aws-s3-buckets.service'

import { AwsS3ObjectsService } from './aws-s3-objects.service'
import { AwsEventBridgeService } from './aws-eventbridge.service'
import { AwsSnsService } from './aws-sns.service'
import { AwsS3SignedUrlService } from './aws-s3-signed-url.service'

// @todo @future extract to independently packaged nestjs module

@Module({
  providers: [
    AwsSesService,
    AwsS3BucketsService,
    AwsS3ObjectsService,
    AwsS3SignedUrlService,
    AwsSnsService,
    AwsEventBridgeService,
  ],
  exports: [
    AwsSesService,
    AwsS3BucketsService,
    AwsS3ObjectsService,
    AwsS3SignedUrlService,
    AwsSnsService,
    AwsEventBridgeService,
  ],
})
export class AwsModule {}
