import { PartialType } from '@nestjs/swagger'
import { CreateBoxProfileDto } from './create-box-profile.dto'

export class UpdateBoxProfileDto extends PartialType(CreateBoxProfileDto) {}
