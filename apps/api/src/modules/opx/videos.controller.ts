import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { GetUser } from '../auth/decorators/get-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { SanitizedUser } from '../auth/types/sanitized-user.type'
import { CreateVideoDto } from './dto/create-video.dto'
import { UpdateVideoDto } from './dto/update-video.dto'
import { VideoDto } from './dto/video.dto'
import { VideosService } from './videos.service'

const CONTROLLER_NAME = 'opx/:boxProfileUuid/videos'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  async getVideos(
    @GetUser() user: SanitizedUser,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
  ): Promise<VideoDto[]> {
    return this.videosService.findAllByUserAndBoxProfile(user, boxProfileUuid)
  }

  @Get(':uuid')
  async getVideo(
    @GetUser() user: SanitizedUser,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<VideoDto> {
    return this.videosService.getOneByUserAndBoxProfile(user, boxProfileUuid, uuid)
  }

  @Post()
  async createVideo(
    @GetUser() user: SanitizedUser,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Body() dto: CreateVideoDto,
  ): Promise<VideoDto> {
    return this.videosService.createByUser(user, boxProfileUuid, dto)
  }

  @Patch(':uuid')
  async updateVideo(
    @GetUser() user: SanitizedUser,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
    @Body() dto: UpdateVideoDto,
  ): Promise<VideoDto> {
    return this.videosService.updateByUser(user, boxProfileUuid, uuid, dto)
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVideo(
    @GetUser() user: SanitizedUser,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<void> {
    return this.videosService.deleteByUserAndBoxProfile(user, boxProfileUuid, uuid)
  }
}
