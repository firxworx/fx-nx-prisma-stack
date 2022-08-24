// @temp until refactor to shared project lib

export enum VideoPlatform {
  YOUTUBE = 'YOUTUBE',
  // VIMEO = 'VIMEO',
}

export interface VideoDto {
  uuid: string
  name: string
  platform: VideoPlatform
  externalId: string
  createdAt: Date
  updatedAt: Date
  groups: VideoGroupDto[]
}

export interface CreateVideoDto extends Pick<VideoDto, 'name' | 'platform' | 'externalId'> {
  groups: VideoDto['groups'][number]['uuid'][]
}

export interface UpdateVideoDto extends Partial<CreateVideoDto> {}

export interface VideoGroupDto {
  uuid: string
  createdAt: Date
  updatedAt: Date // @todo handle dates response
  name: string
  description: string
  videos: VideoDto[]
}
