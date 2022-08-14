import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { Video } from '@prisma/client'
import { GetUser } from '../auth/decorators/get-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { SanitizedUser } from '../auth/types/sanitized-user.type'
import { CreateVideoDto } from './dto/create-video.dto'
import { UpdateVideoDto } from './dto/update-video.dto'
import { VideosService } from './videos.service'

const CONTROLLER_NAME = 'videos'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
export class VideosController {
  private logger = new Logger(this.constructor.name)

  constructor(private readonly videosService: VideosService) {}

  @Get()
  async getVideos(@GetUser() user: SanitizedUser): Promise<Partial<Video>[]> {
    this.logger.debug(`User videos request by ${user.email}`)
    return this.videosService.findAllByUser(user.id) // @todo tighter return types
  }

  @Get(':uuid')
  async getVideo(@GetUser() user: SanitizedUser, @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string) {
    // : Promise<Video>
    this.logger.debug(`User get video '${uuid}' request by ${user.email}`)
    return this.videosService.getOneByUser(user, uuid)
  }

  @Post()
  async createVideo(@GetUser() user: SanitizedUser, @Body() dto: CreateVideoDto): Promise<Video> {
    this.logger.debug(`User create video by ${user.email}`)
    return this.videosService.createByUser(user, dto)
  }

  @Patch(':uuid')
  async updateVideo(
    @GetUser() user: SanitizedUser,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
    @Body() dto: UpdateVideoDto,
  ): Promise<Pick<Video, 'uuid' | 'name' | 'platform' | 'externalId'>> {
    this.logger.debug(`User update video '${uuid}' by ${user.email}`)
    return this.videosService.updateByUser(user, uuid, dto)
  }

  // @todo set appropriate no-content response
  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVideo(
    @GetUser() user: SanitizedUser,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<void> {
    this.logger.debug(`User delete video by ${user.email}`)
    return this.videosService.deleteByUser(user, uuid)
  }
}
