import type { ApiBaseDto } from './api.types'
import { VideoDto, VideoGroupDto } from './videos.types'

export interface BoxProfileDto extends ApiBaseDto {
  name: string
  urlCode: string
  createdAt: Date
  updatedAt: Date
  videos: VideoDto[]
  videoGroups: VideoGroupDto[]
}

export interface CreateBoxProfileDto extends Pick<BoxProfileDto, 'name'> {}

export interface MutateBoxProfileDto extends Partial<CreateBoxProfileDto> {}

export type BoxProfile = Pick<BoxProfileDto, 'uuid' | 'name' | 'urlCode'>

/**
 * API query context required for data queries of children of a given Box Profile.
 *
 * @see ApiParentContext
 */
export type BoxProfileChildQueryContext = {
  boxProfileUuid: string
}
