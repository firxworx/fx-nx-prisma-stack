import { Module } from '@nestjs/common'
import { PrismaUtilsService } from './prisma-utils.service'
import { PrismaService } from './prisma.service'

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, PrismaUtilsService],
  exports: [PrismaService, PrismaUtilsService],
})
export class PrismaModule {}
