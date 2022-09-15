import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'
import { AuthConfig } from 'apps/api/src/config/types/auth-config.interface'
import { PrismaService } from '../../prisma/prisma.service'
import { AuthController } from '../auth.controller'
import { AuthService } from '../auth.service'
import { PasswordService } from '../password.service'

const mockAuthConfig: AuthConfig = {
  jwt: {
    accessToken: {
      secret: 'access-secret',
      expirationTime: 1000,
    },
    refreshToken: {
      secret: 'refresh-secret',
      expirationTime: 10000,
    },
  },
}

const MOCK_CONFIG_SERVICE = {
  get(key: string) {
    switch (key) {
      case 'auth':
        return mockAuthConfig
    }
  },
}

const MOCK_JWT_SERVICE = {
  sign: () => '',
}

const MOCK_USERS: User[] = ['Alice', 'Bob', 'Mallory'].map((name, index) => ({
  id: index + 1,
  uuid: `uuid-${index + 1}`,
  name: `Test ${name}`,
  email: `${name.toLowerCase()}@example.com`,
  createdAt: new Date(),
  updatedAt: new Date(),
  verifiedAt: new Date(),
  password: `password-${index + 1}`,
  refreshToken: `refreshToken-${index + 1}`,
}))

const MOCK_USER = MOCK_USERS[0]

const MOCK_PRISMA_SERVICE = {
  user: {
    create: jest.fn().mockResolvedValue(MOCK_USER),
    update: jest.fn().mockResolvedValue(MOCK_USER),
    findUnique: jest.fn().mockResolvedValue(MOCK_USER),
  },
}

const MOCK_PASSWORD_SERVICE = {
  hash: jest.fn().mockImplementation((input: string) => `${input}-hash`),
  verify: jest.fn().mockImplementation((hash: string, plainText: string) => hash === `${plainText}-hash`),
}

const MOCK_AUTH_SERVICE = {
  registerUser: jest.fn(),
  buildSignOutCookies: jest.fn(),
  changeUserPassword: jest.fn(),
  buildJwtTokenPayload: jest.fn(),
  buildSignedAuthenticationTokenCookie: jest.fn(),
  buildSignedRefreshTokenCookie: jest.fn(),
  setUserRefreshTokenHash: jest.fn(),
  clearUserRefreshToken: jest.fn(),
}

describe('AuthController', () => {
  let controller: AuthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: MOCK_AUTH_SERVICE,
        },
        {
          provide: PrismaService,
          useValue: MOCK_PRISMA_SERVICE,
        },
        {
          provide: PasswordService,
          useValue: MOCK_PASSWORD_SERVICE,
        },
        {
          provide: JwtService,
          useValue: MOCK_JWT_SERVICE,
        },
        {
          provide: ConfigService,
          useValue: MOCK_CONFIG_SERVICE,
        },
      ],
    }).compile()

    const app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe()) // @todo parity with main.ts
    await app.init()

    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
