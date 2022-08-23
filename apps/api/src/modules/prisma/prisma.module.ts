import { Module } from '@nestjs/common'
import { PrismaHelperService } from './prisma-helper.service'
import { PrismaService } from './prisma.service'

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, PrismaHelperService],
  exports: [PrismaService, PrismaHelperService],
})
export class PrismaModule {}
