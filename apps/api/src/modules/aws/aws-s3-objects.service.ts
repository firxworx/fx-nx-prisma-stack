import * as fs from 'fs/promises'
import {
  type ListBucketsCommandOutput,
  type ListObjectsCommandInput,
  type ListObjectsOutput,
  type GetObjectCommandInput,
  type GetObjectOutput,
  type PutObjectCommandInput,
  type PutObjectOutput,
  type DeleteObjectsCommandInput,
  type DeleteObjectsOutput,
  type DeleteObjectCommandInput,
  type DeleteObjectOutput,
  ListBucketsCommand,
  ListObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  S3Client,
} from '@aws-sdk/client-s3'
// import { NodeHttpHandler } from '@aws-sdk/node-http-handler'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Readable } from 'stream'
import { AwsAbstractService } from './aws.abstract.service'

/**
 * NestJS service for working with S3 bucket objects in the project AWS environment.
 */
@Injectable()
export class AwsS3ObjectsService extends AwsAbstractService<S3Client> {
  protected readonly logger = new Logger(this.constructor.name)

  constructor(configService: ConfigService) {
    super(S3Client, configService)
  }

  // private getRequestHandler(): NodeHttpHandler {
  //   return new NodeHttpHandler({
  //     connectionTimeout: 1000,
  //     socketTimeout: 10000,
  //   })
  // }

  /**
   * Return a promise containing the final string data of the given readable stream.
   *
   * @see getObjectData
   */
  async convertStreamToString(stream: Readable): Promise<string> {
    // for nodejs >= 17.5.0
    // return Buffer.concat(await stream.toArray())

    // nodejs < 17.5.0
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = []
      stream.setEncoding('utf-8')
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.once('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
      stream.once('error', reject)
    })
  }

  async listBuckets(): Promise<ListBucketsCommandOutput> {
    try {
      const output = await this.client.send(new ListBucketsCommand({}))

      this.logger.debug('Success listing AWS S3 buckets')
      return output // await then return syntax better supports unit test use-cases
    } catch (error: unknown) {
      this.logger.error('Error listing AWS S3 buckets', error)
      throw error
    }
  }

  public async listObjects(
    bucketName: string,
    options?: Omit<ListObjectsCommandInput, 'Bucket'>,
  ): Promise<ListObjectsOutput> {
    const output = await this.client.send(
      new ListObjectsCommand({
        Bucket: bucketName,
        ...options,
      }),
    )

    return output
  }

  async getObjectSignedUrl(bucketName: string, key: string, expiresIn: number): Promise<string> {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key })
    const output = await getSignedUrl(this.client, command, { expiresIn })

    return output
  }

  public async getObject(
    bucketName: string,
    key: string,
    options?: Omit<GetObjectCommandInput, 'Bucket' | 'Key'>,
  ): Promise<GetObjectOutput> {
    const output = await this.client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
        ...options,
      }),
    )

    return output
  }

  async getObjectData(bucketName: string, key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key })
    const output = await this.client.send(command)
    const data = await this.convertStreamToString(output.Body as Readable)

    return data
  }

  public async putObject(
    bucketName: string,
    key: string,
    body: PutObjectCommandInput['Body'],
    options?: Omit<PutObjectCommandInput, 'Bucket' | 'Body' | 'Key'>,
  ): Promise<PutObjectOutput> {
    const output = this.client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Body: body,
        Key: key,
        ...options,
      }),
    )

    return output
  }

  public async putObjectFromLocalPath(
    bucketName: string,
    key: string,
    path: string,
    options?: Omit<PutObjectCommandInput, 'Bucket' | 'Body' | 'Key'>,
  ): Promise<PutObjectOutput> {
    const buffer = await fs.readFile(path)
    const output = this.putObject(bucketName, key, buffer, options)

    return output
  }

  public async deleteObject(
    bucketName: string,
    key: string,
    options?: Omit<DeleteObjectCommandInput, 'Bucket' | 'Delete'>,
  ): Promise<DeleteObjectOutput> {
    return this.client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
        ...options,
      }),
    )
  }

  public async deleteObjects(
    bucketName: string,
    keys: string[],
    options?: Omit<DeleteObjectsCommandInput, 'Bucket' | 'Key'>,
  ): Promise<DeleteObjectsOutput> {
    return this.client.send(
      new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
        },
        ...options,
      }),
    )
  }
}
