import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'

import { PrismaModule } from '../prisma/prisma.module'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PasswordService } from './password.service'

import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'

@Module({
  imports: [PrismaModule, PassportModule, JwtModule.register({})],
  providers: [AuthService, PasswordService, LocalStrategy, JwtStrategy, JwtRefreshTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
