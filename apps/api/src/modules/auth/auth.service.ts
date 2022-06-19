import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { JwtService } from '@nestjs/jwt'
import { AuthConfig } from '../../config/types/auth-config.interface'

import { Prisma, User } from '../../generated/prisma-client'
import { PrismaService } from '../prisma/prisma.service'
import { ChangePasswordDto } from './dto/change-password.dto'
import { RegisterUserDto } from './dto/register-user.dto'
import { PasswordService } from './password.service'
import { SanitizedUser } from './types/sanitized-user.type'
import { TokenPayload } from './types/token-payload.interface'

@Injectable()
export class AuthService {
  private logger = new Logger(this.constructor.name)

  private ERROR_MESSAGES = {
    SERVER_ERROR: 'Server error',
    INVALID_CREDENTIALS: 'Invalid credentials',
    REGISTRATION_FAILED: 'Failed to register user',
    CHANGE_PASSWORD_FAILED: 'Failed to change user password',
    EMAIL_CONFLICT: 'Email already exists',
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  // @see https://github.com/prisma/prisma/issues/5042#issuecomment-1104679760
  // usage: { select: excludeFields(Prisma.UserScalarFieldEnum, ['password']), }
  // excludeFields<T, K extends keyof T>(fields: T, omit: K[]) {
  //   const result: Partial<Record<keyof T, boolean>> = {}
  //   for (const key in fields) {
  //     if (!omit.includes(key as any)) {
  //       result[key] = true
  //     }
  //   }
  //   return result
  // }

  private getSanitizedUser(user: User): SanitizedUser {
    const { password: _password, refreshToken: _refreshToken, ...restUser } = user
    return restUser
  }

  async registerOrThrow(dto: RegisterUserDto): Promise<SanitizedUser> {
    const { password, ...restDto } = dto
    const passwordHash = await this.passwordService.hash(password)

    try {
      const user = await this.prisma.user.create({
        data: {
          ...restDto,
          password: passwordHash,
        },
      })

      if (!user) {
        throw new InternalServerErrorException(this.ERROR_MESSAGES.REGISTRATION_FAILED)
      }

      return this.getSanitizedUser(user)
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.log(`New user registration email conflict: ${dto.email}`)
          throw new ConflictException(`${this.ERROR_MESSAGES.EMAIL_CONFLICT}: ${dto.email}`)
        }

        this.logger.error(`Prisma database error registering user [${error.code}]: ${error.message}`)
      }

      this.logger.error(String(error))
      throw new InternalServerErrorException(this.ERROR_MESSAGES.SERVER_ERROR)
    }
  }

  // also reset refresh token / ie. the user should be asked to login again
  async changeUserPassword(email: string, dto: ChangePasswordDto): Promise<void> {
    // verify current credentials (throws UnauthorizedException on auth failure)
    await this.getAuthenticatedUserByCredentials(email, dto.oldPassword)

    const passwordHash = await this.passwordService.hash(dto.newPassword)

    try {
      await this.prisma.user.update({
        data: {
          password: passwordHash,
          refreshToken: null,
        },
        where: {
          email,
        },
      })
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        this.logger.error(`Failed to change user password - user not found (${error.code}): ${email}`)
      }

      this.logger.error(String(error))
      throw new InternalServerErrorException(this.ERROR_MESSAGES.CHANGE_PASSWORD_FAILED)
    }
  }

  async setUserRefreshTokenHash(email: string, signedToken: string): Promise<void> {
    const refreshTokenHash = await this.passwordService.hash(signedToken)

    try {
      await this.prisma.user.update({
        data: {
          refreshToken: refreshTokenHash,
        },
        where: {
          email,
        },
      })
    } catch (error: unknown) {
      throw new InternalServerErrorException()
    }
  }

  async clearUserRefreshToken(email: string): Promise<void> {
    await this.prisma.user.update({
      data: {
        refreshToken: null,
      },
      where: {
        email,
      },
    })
  }

  async getAuthenticatedUserByCredentials(email: string, password: string): Promise<SanitizedUser> {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const isValidCredentials = await this.passwordService.verify(user.password, password)

    if (!isValidCredentials) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    return this.getSanitizedUser(user)
  }

  // intended for use in jwt strategies
  async getUserByEmail(email: string): Promise<SanitizedUser> {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    return this.getSanitizedUser(user)
  }

  // supports jwt-refresh-token strategy
  async getAuthenticatedUserByRefreshToken(email: string, signedRefreshToken: string): Promise<SanitizedUser> {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    // throw if the user record is missing the hashed value of the refresh token
    if (!user.refreshToken) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const isValidRefreshToken = await this.passwordService.verify(user.refreshToken, signedRefreshToken)

    if (!isValidRefreshToken) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    return this.getSanitizedUser(user)
  }

  /**
   * Return the user corresponding to the `email` in the given JWT token payload, else
   * `undefined` if the given token cannot be verified or the user is not found.
   */
  public async getUserByAuthenticationToken(token: string): Promise<SanitizedUser | undefined> {
    const authConfig = this.configService.get<AuthConfig>('auth')

    const payload: TokenPayload = this.jwtService.verify(token, {
      secret: authConfig?.jwt.accessToken.secret,
    })

    if (payload.email) {
      const user = await this.prisma.user.findUnique({ where: { email: payload.email } })

      if (user) {
        return this.getSanitizedUser(user)
      }
    }

    return undefined
  }

  public getCookiesForLogOut() {
    return ['Authentication=; HttpOnly; Path=/; Max-Age=0', 'Refresh=; HttpOnly; Path=/; Max-Age=0']
  }

  public getJwtTokenPayload(user: SanitizedUser): TokenPayload {
    return {
      email: user.email,
      name: user.name ?? '',
    }
  }

  public getCookieWithAccessJwtPayload(tokenPayload: TokenPayload): string {
    const authConfig = this.configService.get<AuthConfig>('auth')

    const token = this.jwtService.sign(tokenPayload, {
      secret: authConfig?.jwt.accessToken.secret,
      expiresIn: `${authConfig?.jwt.accessToken.expirationTime}s`,
    })

    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${authConfig?.jwt.accessToken.expirationTime}`
  }

  public getCookieWithRefreshJwtPayload(tokenPayload: TokenPayload): { token: string; cookie: string } {
    const authConfig = this.configService.get<AuthConfig>('auth')

    const token = this.jwtService.sign(tokenPayload, {
      secret: authConfig?.jwt.refreshToken.secret,
      expiresIn: `${authConfig?.jwt.refreshToken.expirationTime}s`,
    })

    return {
      token,
      cookie: `Refresh=${token}; HttpOnly; Path=/; Max-Age=${authConfig?.jwt.refreshToken.expirationTime}`,
    }
  }
}
