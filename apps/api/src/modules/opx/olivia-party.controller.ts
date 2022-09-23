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
import { BoxProfileService } from './box-profile.service'
import { BoxProfileDto } from './dto/box-profile.dto'
import { CreateBoxProfileDto } from './dto/create-box-profile.dto'
import { UpdateBoxProfileDto } from './dto/update-box-profile.dto'

const CONTROLLER_NAME = 'opx'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
export class OliviaPartyController {
  constructor(private readonly boxProfileService: BoxProfileService) {}

  @Get()
  async getBoxProfiles(@GetUser() user: SanitizedUser): Promise<BoxProfileDto[]> {
    return this.boxProfileService.findAllByUser(user)
  }

  @Get(':uuid')
  async getBoxProfile(
    @GetUser() user: SanitizedUser,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<BoxProfileDto> {
    return this.boxProfileService.getOneByUser(user, uuid)
  }

  @Post()
  async createBoxProfile(@GetUser() user: SanitizedUser, @Body() dto: CreateBoxProfileDto): Promise<BoxProfileDto> {
    return this.boxProfileService.createByUser(user, dto)
  }

  @Patch(':uuid')
  async updateBoxProfile(
    @GetUser() user: SanitizedUser,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
    @Body() dto: UpdateBoxProfileDto,
  ): Promise<BoxProfileDto> {
    return this.boxProfileService.updateByUser(user, uuid, dto)
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(
    @GetUser() user: SanitizedUser,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<void> {
    return this.boxProfileService.deleteByUser(user, uuid)
  }
}
