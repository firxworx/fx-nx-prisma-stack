import { GetObjectCommand, ListBucketsCommand, ListBucketsCommandOutput, S3Client } from '@aws-sdk/client-s3'
// import { NodeHttpHandler } from '@aws-sdk/node-http-handler'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Readable } from 'stream'
import { AwsAbstractService } from './aws.abstract.service'

/**
 * WIP NestJS service for working with S3 buckets in the current AWS environment.
 */
@Injectable()
export class AwsS3Service extends AwsAbstractService<S3Client> {
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

  async convertStreamToString(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = []
      stream.setEncoding('utf-8')
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('error', reject)
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    })
  }

  async listBuckets(): Promise<ListBucketsCommandOutput> {
    try {
      const data = await this.client.send(new ListBucketsCommand({}))

      this.logger.debug('Success listing AWS S3 buckets')

      return data // return supports unit tests
    } catch (error: unknown) {
      this.logger.error('Error listing AWS S3 buckets', error)
      throw error
    }
  }

  async getObjectSignedUrl(bucketName: string, key: string, expiresIn: number): Promise<string> {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key })

    return getSignedUrl(this.client, command, { expiresIn })
  }

  async getObjectData(bucketName: string, key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key })
    const output = await this.client.send(command)

    return this.convertStreamToString(output.Body as Readable)
  }
}
