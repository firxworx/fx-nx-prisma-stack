import type { NextPage } from 'next'
import '@tanstack/react-table'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'

import { DataTable } from '../../components/elements/table/DataTable'
import type { VideoDto } from '../../types/videos.types'
import { VideoPlatform } from '../../types/enums/videos.enums'

const data: VideoDto[] = [
  {
    uuid: '0f3f326a-5fcf-4962-95d9-9dad66403847',
    createdAt: new Date('2022-08-05T20:03:07.760Z'),
    updatedAt: new Date('2022-08-14T23:42:57.547Z'),
    name: 'updated name',
    platform: VideoPlatform.YOUTUBE,
    externalId: 'abc123bcda321',
    groups: [
      {
        uuid: 'f5f6585a-3825-4ccd-b72a-bca4e195ad6e',
        createdAt: new Date('2022-08-13T21:21:36.230Z'),
        updatedAt: new Date('2022-08-23T02:06:40.987Z'),
        name: 'updated video group name no vids :D',
        description: 'a video group',
        videos: [],
      },
    ],
  },
  {
    uuid: 'f1e8d597-ce25-424c-8480-95158c38028b',
    createdAt: new Date('2022-08-23T02:08:28.562Z'),
    updatedAt: new Date('2022-08-23T02:08:28.564Z'),
    name: 'really another video',
    platform: VideoPlatform.YOUTUBE,
    externalId: 'fddds123',
    groups: [
      {
        uuid: 'f5f6585a-3825-4ccd-b72a-bca4e195ad6e',
        createdAt: new Date('2022-08-13T21:21:36.230Z'),
        updatedAt: new Date('2022-08-23T02:06:40.987Z'),
        name: 'updated video group name no vids :D',
        description: 'a video group',
        videos: [],
      },
    ],
  },
  {
    uuid: '17a2283a-f4a4-4f03-b8c3-bcb1fe78e769',
    createdAt: new Date('2022-08-23T02:09:40.625Z'),
    updatedAt: new Date('2022-08-23T02:09:40.625Z'),
    name: 'ungrouped video',
    platform: VideoPlatform.YOUTUBE,
    externalId: 'fdeeees123',
    groups: [],
  },
  {
    uuid: 'a578eccf-70bf-4284-998b-089cea994859',
    createdAt: new Date('2022-08-05T19:53:42.036Z'),
    updatedAt: new Date('2022-08-23T16:07:36.739Z'),
    name: 'video name YY',
    platform: VideoPlatform.YOUTUBE,
    externalId: 'asdfasddfddedd',
    groups: [],
  },
  {
    uuid: '7ccbf0b3-551e-4571-9246-92a93fd8e88b',
    createdAt: new Date('2022-08-23T16:57:22.593Z'),
    updatedAt: new Date('2022-08-23T16:57:22.595Z'),
    name: 'adsf',
    platform: VideoPlatform.YOUTUBE,
    externalId: 'asdf',
    groups: [],
  },
  {
    uuid: '920038dc-077b-4ac1-9e52-f243ee36ee64',
    createdAt: new Date('2022-08-23T16:58:30.197Z'),
    updatedAt: new Date('2022-08-23T16:58:30.197Z'),
    name: 'adsf',
    platform: VideoPlatform.YOUTUBE,
    externalId: 'asdfasdfasfasdfasdf',
    groups: [],
  },
  {
    uuid: '36ab9d87-0fd4-4d71-9d8c-c78b890c687b',
    createdAt: new Date('2022-08-23T17:04:53.079Z'),
    updatedAt: new Date('2022-08-23T17:04:53.079Z'),
    name: 'Another Testy',
    platform: VideoPlatform.YOUTUBE,
    externalId: 'sdaf',
    groups: [],
  },
  {
    uuid: '478cd125-cbff-48ee-9732-d73822f6e3f9',
    createdAt: new Date('2022-08-23T02:08:43.848Z'),
    updatedAt: new Date('2022-08-23T17:06:09.224Z'),
    name: 'yet one more vide',
    platform: VideoPlatform.YOUTUBE,
    externalId: 'fdccds12',
    groups: [
      {
        uuid: 'f5f6585a-3825-4ccd-b72a-bca4e195ad6e',
        createdAt: new Date('2022-08-13T21:21:36.230Z'),
        updatedAt: new Date('2022-08-23T02:06:40.987Z'),
        name: 'updated video group name no vids :D',
        description: 'a video group',
        videos: [],
      },
    ],
  },
  {
    uuid: 'c9575143-c794-4e92-912e-a4ee03c6a5e9',
    createdAt: new Date('2022-08-23T02:09:49.703Z'),
    updatedAt: new Date('2022-08-23T17:17:35.767Z'),
    name: 'another ungrouped videz',
    platform: VideoPlatform.YOUTUBE,
    externalId: 'fdexxees122',
    groups: [],
  },
]

const columnHelper = createColumnHelper<VideoDto>()

// @see issue https://github.com/TanStack/table/issues/4241
//
// ColumnDef<VideoDto, string>[] // @todo tighter types
// ColumnDef<VideoDto, any>[]
// ColumnDef<VideoDto, VideoPlatform | string>[]
// const columns = [

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: ColumnDef<VideoDto, any>[] = [
  columnHelper.accessor('name', {
    header: () => 'Name',
  }),
  columnHelper.accessor('platform', {
    header: () => 'Platform',
    cell: (props) => {
      return <span>{props.getValue()}</span>
    },
  }),
  columnHelper.accessor('externalId', {
    header: () => 'External ID',
  }),
]

export const TablePage: NextPage = (_props) => {
  return (
    <div>
      <h2 className="text-lg">DataTable Page</h2>
      <DataTable namespace="videos" data={data} columns={columns} />
    </div>
  )
}

export default TablePage
