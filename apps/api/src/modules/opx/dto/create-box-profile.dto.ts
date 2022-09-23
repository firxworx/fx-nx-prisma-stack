import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateBoxProfileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string
}
