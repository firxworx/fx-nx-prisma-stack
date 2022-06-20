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

  /**
   * Return a new `SanitizedUser` based on the given Prisma database client `User` except with the
   * `password` and `refreshToken` fields removed.
   *
   * As `AuthService` functions provide the user to be appended to the request object by Passportjs,
   * using this method is important to safeguard against sensitive data being leaked into logs, responses, etc.
   */
  private sanitizeUser(user: User): SanitizedUser {
    const { password: _password, refreshToken: _refreshToken, ...restUser } = user
    return restUser
  }

  /**
   * Register (create) a new user or throw an Error on failure.
   *
   * @throws {ConflictException} if given an email that already exists.
   * @throws {InternalServerErrorException} in other cases of failure.
   */
  async registerUser(dto: RegisterUserDto): Promise<SanitizedUser> {
    const { password, ...restDto } = dto
    const passwordHash = await this.passwordService.hash(password)

    try {
      const user = await this.prisma.user.create({
        data: {
          ...restDto,
          password: passwordHash,
        },
      })

      return this.sanitizeUser(user)
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

  /**
   * Change a user's password and clear their refreshToken hash.
   *
   * @throws {UnauthorizedException} if current (old) password fails verification
   * @throws {InternalServerErrorException} in other cases of failure
   */
  async changeUserPassword(email: string, dto: ChangePasswordDto): Promise<void> {
    // verify the current credentials - throws UnauthorizedException on auth failure
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

  /**
   * Save a user's refresh token hash, as computed from the given signed refresh token.
   */
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
      throw new InternalServerErrorException(this.ERROR_MESSAGES.SERVER_ERROR)
    }
  }

  /**
   * Reset (set to `null`) a user's refresh token hash.
   */
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

  /**
   * Return the user associated with the given credentials or else throw an Error.
   *
   * @throws {UnauthorizedException} if no user is found or the given credentials are invalid.
   */
  async getAuthenticatedUserByCredentials(email: string, password: string): Promise<SanitizedUser> {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const isValidCredentials = await this.passwordService.verify(user.password, password)

    if (!isValidCredentials) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    return this.sanitizeUser(user)
  }

  /**
   * Return the user with the given email address.
   * Applicable to Passport strategies that append the authenticated user to the request object.
   *
   * @throws {UnauthorizedException} if no user is found with the given email
   */
  async getUserByEmail(email: string): Promise<SanitizedUser> {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    return this.sanitizeUser(user)
  }

  /**
   * Return the `SanitizedUser` corresponding to the given email address and signed refresh token.
   * Applicable to the Passport JWT refresh token strategy.
   *
   * @throws {UnauthorizedException} if no user is found with the given email
   */
  async getAuthenticatedUserByRefreshToken(email: string, signedRefreshToken: string): Promise<SanitizedUser> {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    // throw if the user record is missing a refresh token hash
    if (!user.refreshToken) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const isValidRefreshToken = await this.passwordService.verify(user.refreshToken, signedRefreshToken)

    if (!isValidRefreshToken) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    return this.sanitizeUser(user)
  }

  /**
   * Return the user corresponding to the `email` contained in the given JWT payload or else `undefined`.
   * This method may not be necessary if using a PassportJS' JWT strategy to perform this functionality.
   */
  public async getUserByAuthenticationToken(token: string): Promise<SanitizedUser | undefined> {
    const authConfig = this.configService.get<AuthConfig>('auth')

    const payload: TokenPayload = this.jwtService.verify(token, {
      secret: authConfig?.jwt.accessToken.secret,
    })

    if (payload.email) {
      const user = await this.prisma.user.findUnique({ where: { email: payload.email } })

      if (user) {
        return this.sanitizeUser(user)
      }
    }

    return undefined
  }

  /**
   * Return the raw JWT token payload corresponding to the given `SanitizedUser`.
   */
  public buildJwtTokenPayload(user: SanitizedUser): TokenPayload {
    return {
      email: user.email,
      name: user.name,
    }
  }

  /**
   * Return an Authentication token cookie with a signed JWT created with the given payload.
   */
  public buildSignedAuthenticationTokenCookie(tokenPayload: TokenPayload): string {
    const authConfig = this.configService.get<AuthConfig>('auth')

    const token = this.jwtService.sign(tokenPayload, {
      secret: authConfig?.jwt.accessToken.secret,
      expiresIn: `${authConfig?.jwt.accessToken.expirationTime}s`,
    })

    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${authConfig?.jwt.accessToken.expirationTime}`
  }

  /**
   * Return a Refresh token cookie with a signed JWT created with the given payload.
   */
  public buildSignedRefreshTokenCookie(tokenPayload: TokenPayload): { token: string; cookie: string } {
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

  /**
   * Return Authentication and Refresh cookies with Max-Age 0 for sign-out.
   */
  public buildSignOutCookies() {
    return ['Authentication=; HttpOnly; Path=/; Max-Age=0', 'Refresh=; HttpOnly; Path=/; Max-Age=0']
  }
}
