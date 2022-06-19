import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { GetUser } from '../../decorators/get-user.decorator'
import { AuthService } from './auth.service'
import { ChangePasswordDto } from './dto/change-password.dto'
import { RegisterUserDto } from './dto/register-user.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { RequestWithUser } from './types/request-with-user.interface'
import { SanitizedUser } from './types/sanitized-user.type'

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  private logger = new Logger(this.constructor.name)

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    // @todo restrict, send user verification, etc
    this.logger.debug(`User registration request: ${dto.email}`)

    return this.authService.registerOrThrow(dto)
  }

  // @Post('change-password')
  // async changePassword(@GetUser() user: SanitizedUser, @Body() dto: ChangePasswordDto) {
  //   // return this.authService.updateUserPassword(user.id, dto.oldPassword, dto.newPassword)
  // }

  @Post('sign-in')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK) // override nestjs default 201
  async signIn(@Req() request: RequestWithUser) {
    const { user } = request

    const payload = this.authService.getJwtTokenPayload(user)

    const accessTokenCookie = this.authService.getCookieWithAccessJwtPayload(payload)
    const { cookie: refreshTokenCookie, token: signedRefreshToken } =
      this.authService.getCookieWithRefreshJwtPayload(payload)

    await this.authService.setUserRefreshTokenHash(user.email, signedRefreshToken)

    request.res?.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie])
    return user
  }

  @Post('sign-out')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(@Req() request: RequestWithUser): Promise<void> {
    await this.authService.clearUserRefreshToken(request.user.email)
    request.res?.setHeader('Set-Cookie', this.authService.getCookiesForLogOut())
  }

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  refresh(@Req() request: RequestWithUser) {
    const accessTokenCookie = this.authService.getCookieWithAccessJwtPayload(request.user)

    request.res?.setHeader('Set-Cookie', accessTokenCookie)
    return request.user
  }
}
