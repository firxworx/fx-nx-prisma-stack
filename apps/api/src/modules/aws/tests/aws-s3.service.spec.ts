import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { AwsS3Service } from '../aws-s3.service'
import type { AwsModuleConfig } from '../types/aws-module-config.interface'

// yarn test:api --test-name-pattern=AwsS3Service

const mockAwsConfig: AwsModuleConfig = {
  region: 'ca-central-1',
  credentials: {
    accessKeyId: 'ABCD1234',
    secretAccessKey: 'SECRET',
  },
  ses: {
    senderAddress: 'sender@example.com',
    replyToAddress: 'reply-to@example.com',
  },
}

const MOCK_CONFIG_SERVICE = {
  get(key: string) {
    switch (key) {
      case 'aws':
        return mockAwsConfig
    }
  },
}

describe('AwsS3Service', () => {
  let service: AwsS3Service

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwsS3Service,
        {
          provide: ConfigService,
          useValue: MOCK_CONFIG_SERVICE,
        },
      ],
    }).compile()

    service = module.get<AwsS3Service>(AwsS3Service)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
