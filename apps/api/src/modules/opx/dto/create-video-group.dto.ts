import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateVideoGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  enabled?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  videos?: string[]
}
