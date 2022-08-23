// @temp until refactor to shared project lib
export interface VideoQueryDto {
  uuid: string
  name: string
  platform: string
  externalId: string
  createdAt: Date
  updatedAt: Date
  groups: VideoGroupQueryDto[]
}

export interface VideoGroupQueryDto {
  uuid: 'c7b6e226-5978-4986-aea0-1c9bb42aaa35'
  createdAt: '2022-08-14T20:41:24.195Z'
  updatedAt: '2022-08-14T20:41:24.198Z'
  name: 'new video group'
  description: 'another video group'
  videos: VideoQueryDto[]
}
