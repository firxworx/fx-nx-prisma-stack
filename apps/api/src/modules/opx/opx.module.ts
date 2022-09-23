import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { BoxProfileService } from './box-profile.service'
import { OliviaPartyController } from './olivia-party.controller'
import { VideoGroupsController } from './video-groups.controller'
import { VideoGroupsService } from './video-groups.service'
import { VideosController } from './videos.controller'
import { VideosService } from './videos.service'

// @todo add phrases controller + service

@Module({
  imports: [PrismaModule],
  providers: [BoxProfileService, VideosService, VideoGroupsService],
  controllers: [OliviaPartyController, VideosController, VideoGroupsController],
})
export class OpxModule {}
