import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { VideoPlatform } from '@prisma/client'

export class CreateVideoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ enum: Object.values(VideoPlatform), name: 'platform' })
  @IsString()
  @IsIn(Object.values(VideoPlatform))
  platform!: VideoPlatform

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  externalId!: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  groups?: string[]
}
