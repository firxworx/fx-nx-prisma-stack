import type { VideoGroup } from '@prisma/client'

export const VIDEO_GROUP_MODEL_PUBLIC_FIELDS = ['uuid', 'createdAt', 'updatedAt', 'enabledAt', 'name'] as const

export const VIDEO_GROUP_MODEL_NULLABLE_FIELDS: ReadonlyArray<keyof VideoGroup> = ['enabledAt']
