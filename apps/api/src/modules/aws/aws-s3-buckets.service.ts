import { Injectable, Logger } from '@nestjs/common'
import {
  AccelerateConfiguration,
  Bucket,
  CORSConfiguration,
  CreateBucketCommand,
  CreateBucketCommandInput,
  CreateBucketCommandOutput,
  DeleteBucketCommand,
  DeleteBucketCommandOutput,
  GetBucketTaggingCommand,
  GetBucketTaggingCommandOutput,
  ListBucketsCommand,
  ListBucketsCommandOutput,
  PutBucketAccelerateConfigurationCommand,
  PutBucketAccelerateConfigurationCommandOutput,
  PutBucketAclCommand,
  PutBucketAclCommandInput,
  PutBucketAclCommandOutput,
  PutBucketCorsCommand,
  PutBucketCorsCommandOutput,
  PutBucketEncryptionCommand,
  PutBucketEncryptionCommandInput,
  PutBucketEncryptionCommandOutput,
  PutBucketLoggingCommand,
  PutBucketLoggingCommandInput,
  PutBucketLoggingCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3'
import { AwsAbstractService } from './aws.abstract.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AwsS3BucketsService extends AwsAbstractService<S3Client> {
  protected readonly logger = new Logger(this.constructor.name)

  // @future revise to use an injected provider e.g.
  // public constructor(@Inject(S3_SERVICE) private readonly client: S3Client) {}

  constructor(configService: ConfigService) {
    super(S3Client, configService)
  }

  public async listBuckets(): Promise<ListBucketsCommandOutput> {
    return await this.client.send(new ListBucketsCommand({}))
  }

  public async findBucket(bucketName: string): Promise<Bucket | undefined> {
    const listBucketsOutput = await this.client.send(new ListBucketsCommand({}))

    return listBucketsOutput?.Buckets?.find((b) => b.Name === bucketName)
  }

  public async createBucket(
    bucketName: string,
    options: Omit<CreateBucketCommandInput, 'Bucket'> = {},
  ): Promise<CreateBucketCommandOutput> {
    return await this.client.send(
      new CreateBucketCommand({
        Bucket: bucketName,
        ...options,
      }),
    )
  }

  public async deleteBucket(bucketName: string): Promise<DeleteBucketCommandOutput> {
    return await this.client.send(
      new DeleteBucketCommand({
        Bucket: bucketName,
      }),
    )
  }

  public async getBucketTagging(bucketName: string): Promise<GetBucketTaggingCommandOutput> {
    const output = await this.client.send(
      new GetBucketTaggingCommand({
        Bucket: bucketName,
      }),
    )

    return output
  }

  public async updateBucketCors(
    bucketName: string,
    configuration: CORSConfiguration,
  ): Promise<PutBucketCorsCommandOutput> {
    const output = await this.client.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: configuration,
      }),
    )

    return output
  }

  public async updateAcl(
    bucketName: string,
    configuration: Omit<PutBucketAclCommandInput, 'Bucket'>,
  ): Promise<PutBucketAclCommandOutput> {
    const output = await this.client.send(
      new PutBucketAclCommand({
        Bucket: bucketName,
        ...configuration,
      }),
    )

    return output
  }

  public async updateBucketLogging(
    bucketName: string,
    configuration: Omit<PutBucketLoggingCommandInput, 'Bucket'>,
  ): Promise<PutBucketLoggingCommandOutput> {
    const output = await this.client.send(
      new PutBucketLoggingCommand({
        Bucket: bucketName,
        ...configuration,
      }),
    )

    return output
  }

  public async updateBucketEncryption(
    bucketName: string,
    configuration: Omit<PutBucketEncryptionCommandInput, 'Bucket'>,
  ): Promise<PutBucketEncryptionCommandOutput> {
    const output = await this.client.send(
      new PutBucketEncryptionCommand({
        Bucket: bucketName,
        ...configuration,
      }),
    )

    return output
  }

  public async updateBucketAccelerateConfiguration(
    bucketName: string,
    configuration: AccelerateConfiguration,
  ): Promise<PutBucketAccelerateConfigurationCommandOutput> {
    const output = await this.client.send(
      new PutBucketAccelerateConfigurationCommand({
        Bucket: bucketName,
        AccelerateConfiguration: configuration,
      }),
    )

    return output
  }
}
