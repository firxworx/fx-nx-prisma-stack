import { Expose, Type } from 'class-transformer'
import type { Video, VideoGroup } from '@prisma/client'
import { VideoPlatform } from '../../constants/video-platform.enum'
import { VideoGroupResponseDto } from './video-group.response.dto'
import { InternalServerErrorException } from '@nestjs/common'

const VIDEO_DTO_FIELDS = ['uuid', 'createdAt', 'updatedAt', 'name', 'platform', 'externalId'] as const

export class VideoResponseDto {
  @Expose()
  uuid!: string

  @Expose()
  createdAt!: Date

  @Expose()
  updatedAt!: Date

  @Expose()
  name!: string

  @Expose()
  platform!: VideoPlatform

  @Expose()
  externalId!: string

  @Expose()
  @Type(() => VideoGroupResponseDto)
  groups!: VideoGroupResponseDto[]

  constructor(partial: Partial<Video & { groups: { videoGroup: Partial<VideoGroup> }[] }>) {
    const videoFields = VIDEO_DTO_FIELDS.reduce((acc, fieldName) => {
      if (partial[fieldName] === undefined || partial[fieldName] === null) {
        throw new InternalServerErrorException(
          `Invalid query result: missing expected data for required field '${fieldName}'`,
        )
      }

      return {
        ...acc,
        [fieldName]: partial[fieldName],
      }
    }, {} as Partial<Video>)

    const groupsField = partial.groups?.map((vg) => new VideoGroupResponseDto(vg.videoGroup)) ?? []

    Object.assign(this, videoFields, {
      groups: groupsField,
    })
  }
}
