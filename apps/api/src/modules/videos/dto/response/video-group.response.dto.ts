import { InternalServerErrorException } from '@nestjs/common'
import type { Video, VideoGroup } from '@prisma/client'
import { Expose, Type } from 'class-transformer'
import { VideoResponseDto } from './video.response.dto'

const VIDEO_GROUP_DTO_FIELDS = ['uuid', 'name', 'description'] as const
const VIDEO_GROUP_DTO_OPTIONAL_FIELDS: typeof VIDEO_GROUP_DTO_FIELDS[number][] = ['description']

export class VideoGroupResponseDto {
  @Expose()
  uuid!: string

  @Expose()
  name!: string

  @Expose()
  description?: string

  @Expose()
  @Type(() => VideoResponseDto)
  videos!: VideoResponseDto[]

  constructor(partial: Partial<VideoGroup & { videos: { video: Partial<Video> }[] }>) {
    const videoGroupFields = VIDEO_GROUP_DTO_FIELDS.reduce((acc, fieldName) => {
      if (
        (!VIDEO_GROUP_DTO_OPTIONAL_FIELDS.includes(fieldName) && partial[fieldName] === undefined) ||
        partial[fieldName] === null
      ) {
        throw new InternalServerErrorException(
          `Invalid query result: missing expected data for required field '${fieldName}'`,
        )
      }

      return {
        ...acc,
        [fieldName]: partial[fieldName],
      }
    }, {} as Partial<VideoGroup>)

    const videosField = partial.videos?.map((vg) => new VideoResponseDto(vg.video)) ?? []

    Object.assign(this, videoGroupFields, { videos: videosField })
  }
}
