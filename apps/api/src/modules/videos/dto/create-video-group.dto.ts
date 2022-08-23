import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateVideoGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  videos?: string[]
}
