import { PartialType } from '@nestjs/swagger'
import { CreateVideoGroupDto } from './create-video-group.dto'

export class UpdateVideoGroupDto extends PartialType(CreateVideoGroupDto) {}
