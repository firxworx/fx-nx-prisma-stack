import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { VideoGroupsController } from './video-groups.controller'
import { VideoGroupsService } from './video-groups.service'
import { VideosController } from './videos.controller'
import { VideosService } from './videos.service'

@Module({
  imports: [PrismaModule],
  providers: [VideosService, VideoGroupsService],
  controllers: [VideosController, VideoGroupsController],
})
export class VideosModule {}
