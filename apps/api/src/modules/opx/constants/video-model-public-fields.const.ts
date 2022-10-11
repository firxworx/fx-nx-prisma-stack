import type { Video } from '@prisma/client'

export const VIDEO_MODEL_PUBLIC_FIELDS = ['uuid', 'createdAt', 'updatedAt', 'name', 'platform', 'externalId'] as const

export const VIDEO_MODEL_NULLABLE_FIELDS: ReadonlyArray<keyof Video> = []
