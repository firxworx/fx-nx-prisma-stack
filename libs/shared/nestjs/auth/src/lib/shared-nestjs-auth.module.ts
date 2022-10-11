import { Module } from '@nestjs/common'
import { SharedNestjsAuthController } from './shared-nestjs-auth.controller'

@Module({
  controllers: [SharedNestjsAuthController],
  providers: [],
  exports: [],
})
export class SharedNestjsAuthModule {}
