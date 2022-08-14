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
import type { VideoGroup } from '@prisma/client'
import { GetUser } from '../auth/decorators/get-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { SanitizedUser } from '../auth/types/sanitized-user.type'
import { CreateVideoGroupDto } from './dto/create-video-group.dto'
import { UpdateVideoGroupDto } from './dto/update-video-group.dto'
import { VideoGroupsService } from './video-groups.service'

const CONTROLLER_NAME = 'video-groups'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
export class VideoGroupsController {
  private logger = new Logger(this.constructor.name)

  constructor(private readonly videosGroupsService: VideoGroupsService) {}

  // @todo stricter return types for all methods in VideoGroupsController class

  @Get()
  async getVideoGroups(@GetUser() user: SanitizedUser): Promise<Partial<VideoGroup>[]> {
    this.logger.debug(`Get all system video groups request by ${user.email}`)
    return this.videosGroupsService.findAllByUser(user)
  }

  @Get(':uuid')
  async getVideoGroup(
    @GetUser() user: SanitizedUser,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ) {
    this.logger.debug(`Get all user video groups request by ${user.email}`)
    return this.videosGroupsService.getOneByUser(user, uuid)
  }

  @Post()
  async createVideoGroup(
    @GetUser() user: SanitizedUser,
    @Body() dto: CreateVideoGroupDto,
  ): Promise<Partial<VideoGroup>> {
    this.logger.debug(`Create video group request by ${user.email}`)
    return this.videosGroupsService.createByUser(user, dto)
  }

  @Patch(':uuid')
  async updateVideoGroup(
    @GetUser() user: SanitizedUser,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
    @Body() dto: UpdateVideoGroupDto,
  ): Promise<Partial<VideoGroup>> {
    this.logger.debug(`User update video '${uuid}' by ${user.email}`)
    return this.videosGroupsService.updateByUser(user, uuid, dto)
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVideoGroup(
    @GetUser() user: SanitizedUser,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<void> {
    this.logger.debug(`Delete user video group '${uuid}' request by ${user.email}`)
    return this.videosGroupsService.deleteByUser(user, uuid)
  }
}
