import { Injectable, Logger } from '@nestjs/common'
import {
  type ObjectIdentifier,
  type GetObjectCommandInput,
  type PutObjectCommandInput,
  type DeleteObjectCommandInput,
  type DeleteObjectsCommandInput,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { AwsAbstractService } from './aws.abstract.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AwsS3SignedUrlService extends AwsAbstractService<S3Client> {
  protected readonly logger = new Logger(this.constructor.name)

  readonly DEFAULT_EXPIRES_IN = 3600 as const

  // @future injected provider + make module dynamic + ship as dedicated lib e.g. like nestjs-s3
  // public constructor(
  //   @Inject(S3_SERVICE) private readonly client: S3Client,
  // ) {}

  constructor(configService: ConfigService) {
    super(S3Client, configService)
  }

  async getSignedUrl(
    bucketName: string,
    key: string,
    expiresIn: number = this.DEFAULT_EXPIRES_IN,
    options?: Omit<GetObjectCommandInput, 'Bucket' | 'Key'>,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
      ...options,
    })

    const preSignedUrl = await getSignedUrl(this.client, command, {
      expiresIn,
    })

    return preSignedUrl
  }

  async getPutSignedUrl(
    bucket: string,
    key: string,
    expiresIn: number = this.DEFAULT_EXPIRES_IN,
    options?: Omit<PutObjectCommandInput, 'Bucket' | 'Body' | 'Key'>,
  ): Promise<{ url: string; key: string }> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ...options,
    })

    const preSignedUrl = await getSignedUrl(this.client, command, {
      expiresIn,
    })

    return {
      url: preSignedUrl,
      key: key,
    }
  }

  async getDeleteSignedUrl(
    bucketName: string,
    key: string,
    expiresIn: number = this.DEFAULT_EXPIRES_IN,
    options?: Omit<DeleteObjectCommandInput, 'Bucket' | 'Key'>,
  ): Promise<string> {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
      ...options,
    })

    const preSignedUrl = await getSignedUrl(this.client, command, {
      expiresIn,
    })

    return preSignedUrl
  }

  async getDeleteObjectsSignedUrl(
    bucketName: string,
    keys: string[],
    expiresIn: number = this.DEFAULT_EXPIRES_IN,
    options?: Omit<DeleteObjectsCommandInput, 'Bucket' | 'Delete'>,
  ): Promise<string> {
    const objectKeys: ObjectIdentifier[] = keys.map((k) => ({
      Key: k,
    }))

    const command = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: objectKeys,
      },
      ...options,
    })

    const preSignedUrl = await getSignedUrl(this.client, command, {
      expiresIn,
    })

    return preSignedUrl
  }
}
