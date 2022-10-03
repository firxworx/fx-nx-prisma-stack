import { VideoGroup } from '@prisma/client'

export const VIDEO_GROUP_MODEL_PUBLIC_FIELDS = ['uuid', 'createdAt', 'updatedAt', 'name'] as const

export const VIDEO_GROUP_MODEL_NULLABLE_FIELDS: (keyof VideoGroup)[] = [] // e.g. 'description'
