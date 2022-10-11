import { Expose, Type } from 'class-transformer'
import type { BoxProfile, Video, VideoGroup } from '@prisma/client'
import { VideoGroupDto } from './video-group.dto'
import { InternalServerErrorException } from '@nestjs/common'
import { VideoDto } from './video.dto'

/**
 * Response DTO for BoxProfile model, compatible with NestJS' `ClassSerializerInterceptor`.
 *
 * The constructor accepts the result of a prisma query and maps the data fields to this DTO.
 */
export class BoxProfileDto {
  // @todo restrict fields in BoxProfileDto
  @Expose()
  uuid!: string

  @Expose()
  createdAt!: Date

  @Expose()
  updatedAt!: Date

  @Expose()
  name!: string

  @Expose()
  urlCode!: string

  // @temp disabled to debug (videos + videoGroups in box profile dto)

  // @Expose()
  // @Type(() => VideoDto)
  // videos!: VideoDto[]

  // @Expose()
  // @Type(() => VideoGroupDto)
  // videoGroups!: VideoGroupDto[]

  // @todo add phraseGroups to BoxProfile DTO

  constructor(
    partial: Partial<
      BoxProfile & { videos: { video: Partial<Video> }[]; videoGroups: { videoGroup: Partial<VideoGroup> }[] }
    >,
  ) {
    // @todo add phraseGroups to BoxProfile DTO
    const BOX_PROFILE_DTO_FIELDS = [
      'uuid',
      'createdAt',
      'updatedAt',
      'name',
      'urlCode',
      'videos',
      'videoGroups',
    ] as const

    const boxProfileFields = BOX_PROFILE_DTO_FIELDS.reduce((acc, fieldName) => {
      if (partial[fieldName] === undefined || partial[fieldName] === null) {
        throw new InternalServerErrorException(
          `Invalid query result: missing expected data for required field '${fieldName}'`,
        )
      }

      return {
        ...acc,
        [fieldName]: partial[fieldName],
      }
    }, {} as Partial<BoxProfile>)

    // @temp debug
    // // map prisma's overly-nested query result (due to many-to-many) to response DTO
    // // the sort is because it doesn't appear currently possible to sort nested results w/ select (only via raw sql query)
    // const videosField =
    //   partial.videos?.map((vg) => new VideoDto(vg.video)).sort((a, b) => a.name.localeCompare(b.name)) ?? []

    // const videoGroupsField =
    //   partial.videoGroups?.map((vg) => new VideoGroupDto(vg.videoGroup)).sort((a, b) => a.name.localeCompare(b.name)) ??
    //   []

    Object.assign(this, boxProfileFields, {
      // videos: videosField,
      // videoGroups: videoGroupsField,
    })
  }
}
