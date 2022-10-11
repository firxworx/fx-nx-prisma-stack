export enum VideoPlatform {
  YOUTUBE = 'YOUTUBE',
  // VIMEO = 'VIMEO',
}

export const VideoPlatformDisplayName: Record<VideoPlatform, string> = {
  YOUTUBE: 'YouTube',
} as const
