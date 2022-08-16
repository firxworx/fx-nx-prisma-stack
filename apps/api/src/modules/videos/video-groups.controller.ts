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
import { GetUser } from '../auth/decorators/get-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { SanitizedUser } from '../auth/types/sanitized-user.type'
import { CreateVideoGroupDto } from './dto/create-video-group.dto'
import { UpdateVideoGroupDto } from './dto/update-video-group.dto'
import { VideoGroupDto } from './dto/video-group.dto'
import { VideoGroupsService } from './video-groups.service'

const CONTROLLER_NAME = 'video-groups'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
export class VideoGroupsController {
  private logger = new Logger(this.constructor.name)

  constructor(private readonly videosGroupsService: VideoGroupsService) {}

  @Get()
  async getVideoGroups(@GetUser() user: SanitizedUser): Promise<VideoGroupDto[]> {
    return this.videosGroupsService.findAllByUser(user)
  }

  @Get(':uuid')
  async getVideoGroup(
    @GetUser() user: SanitizedUser,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<VideoGroupDto> {
    return this.videosGroupsService.getOneByUser(user, uuid)
  }

  @Post()
  async createVideoGroup(@GetUser() user: SanitizedUser, @Body() dto: CreateVideoGroupDto): Promise<VideoGroupDto> {
    return this.videosGroupsService.createByUser(user, dto)
  }

  @Patch(':uuid')
  async updateVideoGroup(
    @GetUser() user: SanitizedUser,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
    @Body() dto: UpdateVideoGroupDto,
  ): Promise<VideoGroupDto> {
    return this.videosGroupsService.updateByUser(user, uuid, dto)
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVideoGroup(
    @GetUser() user: SanitizedUser,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<void> {
    return this.videosGroupsService.deleteByUser(user, uuid)
  }
}
