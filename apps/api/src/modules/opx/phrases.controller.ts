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

const CONTROLLER_NAME = 'opx/:boxProfileUuid/phrases'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
export class PhrasesController {
  constructor(private readonly videosService: VideosService) {}

  // query all the phrase groups associated with the box profile (@future support optional ?active=true/false flag?)
  @Get()
  async getPhraseGroups(
    @GetUser() user: SanitizedUser,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
  ): Promise<VideoDto[]> {
    return this.videosService.findAllByUserAndBoxProfile(user, boxProfileUuid)
  }

  // query a single phrase group
  @Get(':phraseGroupUuid')
  async getPhraseGroup(
    @GetUser() user: SanitizedUser,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Param('phraseGroupUuid', new ParseUUIDPipe({ version: '4' })) phraseGroupUuid: string,
  ): Promise<VideoDto> {
    return this.videosService.getOneByUserAndBoxProfile(user, boxProfileUuid, phraseGroupUuid)
  }

  // create a phrase group
  @Post()
  async createPhraseGroup(
    @GetUser() user: SanitizedUser,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Body() dto: CreateVideoDto,
  ): Promise<VideoDto> {
    return this.videosService.createByUser(user, boxProfileUuid, dto)
  }

  @Patch(':phraseGroupUuid')
  async updatePhraseGroup(
    @GetUser() user: SanitizedUser,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Param('phraseGroupUuid', new ParseUUIDPipe({ version: '4' })) phraseGroupUuid: string,
    @Body() dto: UpdateVideoDto,
  ): Promise<VideoDto> {
    return this.videosService.updateByUser(user, boxProfileUuid, phraseGroupUuid, dto)
  }

  @Delete(':phraseGroupUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePhraseGroup(
    @GetUser() user: SanitizedUser,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Param('phraseGroupUuid', new ParseUUIDPipe({ version: '4' })) phraseGroupUuid: string,
  ): Promise<void> {
    return this.videosService.deleteByUserAndBoxProfile(user, boxProfileUuid, phraseGroupUuid)
  }
}
