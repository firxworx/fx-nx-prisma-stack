import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'
import type { AuthConfig } from '../../../config/types/auth-config.interface'
import { PrismaService } from '../../prisma/prisma.service'
import { AuthService } from '../auth.service'
import { RegisterUserDto } from '../dto/register-user.dto'
import { PasswordService } from '../password.service'
import { SanitizedUser } from '../types/sanitized-user.type'

// yarn test:api --test-name-pattern=AuthService

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
  get(key: string): AuthConfig {
    switch (key) {
      case 'auth':
        return mockAuthConfig
      default:
        throw new Error(`Unimplemented mock config key: '${key}'`)
    }
  },
}

const MOCK_JWT_SERVICE = {
  sign: (): string => '',
}

const getMockUser = (id: number, name: string, partialOverride?: Partial<User>): User => ({
  id,
  uuid: `uuid-${id}`,
  name: `Test ${name}`,
  email: `${name.toLowerCase()}@example.com`,
  createdAt: new Date(),
  updatedAt: new Date(),
  verifiedAt: new Date(),
  password: `password-${id}`,
  refreshToken: `refreshToken-${id}`,
  ...(partialOverride || {}),
})

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

describe('AuthService', () => {
  let authService: AuthService
  let prismaService: PrismaService
  let passwordService: PasswordService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        AuthService,
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

    authService = module.get<AuthService>(AuthService)
    prismaService = module.get<PrismaService>(PrismaService)
    passwordService = module.get<PasswordService>(PasswordService)
  })

  it('should be defined', () => {
    expect(authService).toBeDefined()
  })

  describe('registering a new user', () => {
    const dto: RegisterUserDto = {
      email: 'hello@example.com',
      name: 'Test User',
      password: 'a random password',
    }

    let passwordHashSpy: jest.SpyInstance
    let userCreateSpy: jest.SpyInstance

    let result: SanitizedUser

    beforeAll(async () => {
      userCreateSpy = jest.spyOn(prismaService.user, 'create').mockResolvedValue(getMockUser(7, dto.name, dto))
      passwordHashSpy = jest.spyOn(passwordService, 'hash')

      result = await authService.registerUser(dto)
    })

    it('creates user with prisma', async () => {
      expect(userCreateSpy).toHaveBeenCalled()
    })

    it('saves user with password hash returned by PasswordService', async () => {
      expect(passwordHashSpy).toHaveBeenCalledWith(dto.password)
      expect(userCreateSpy).toHaveBeenCalledWith({
        data: {
          ...dto,
          password: passwordService.hash(dto.password),
        },
      })
    })

    it('returns a sanitized user with no sensitive properties defined', async () => {
      expect((result as User)['password']).toBeUndefined()
      expect((result as User)['refreshToken']).toBeUndefined()
    })

    it('returns a user with name + email matching the input dto', async () => {
      expect(result.name).toBe(dto.name)
      expect(result.email).toBe(dto.email)
    })
  })
})

// afterEach(() => {
//   jest.resetAllMocks()
// })
