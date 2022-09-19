/**
 * Enum with values that represent different YouTube video quality levels.
 */
export enum YouTubeVideoQuality {
  LOW = 'LOW',
  MED = 'MEDIUM',
  HIGH = 'HIGH',
  MAX = 'MAX',
}

/**
 * Return the URL of a YouTube video at the US/global youtube.com domain given its YouTube video ID.
 *
 * This is a simple concatenation function: no check is performed to confirm the validity of the
 * video ID or that the video actually exists and is playable on YouTube.
 */
export const getYouTubeVideoUrl = (videoId: string): string => {
  return `https://www.youtube.com/watch?v=${videoId}`
}

/**
 * Return the URL of a YouTube video thumbnail at img.youtube.com/vi for the given video ID and
 * thumbnail/video quality.
 *
 * This is a simple concatenation function: no check is performed to confirm the validity of the
 * video ID or that the video actually exists and is playable on YouTube.
 *
 * Each thumbnail is a fixed size for a given quality level (e.g. `MED` quality is 320px wide)
 * where it exists, otherwise YouTube returns a small error thumbnail. This fact enabls a reasonably
 * accurate proxy/check to determine if a video exists or not without hitting the YouTube API.
 * Only in limited corner cases will a video exist without a thumbnail.
 *
 * @see isValidYouTubeVideoId
 */
export const getYouTubeThumbUrl = (videoId: string, quality: YouTubeVideoQuality): string => {
  const prefix = 'https://img.youtube.com/vi'
  const suffix = 'default.jpg'

  switch (quality) {
    case YouTubeVideoQuality.LOW: {
      return `${prefix}/${videoId}/sd${suffix}`
    }
    case YouTubeVideoQuality.MED: {
      return `${prefix}/${videoId}/mq${suffix}`
    }
    case YouTubeVideoQuality.HIGH: {
      return `${prefix}/${videoId}/hq${suffix}`
    }
    case YouTubeVideoQuality.MAX: {
      return `${prefix}/${videoId}/max${suffix}`
    }
  }
}

/**
 * Check if the given YouTube video ID is valid and corresponds to a live video.
 *
 * The function uses a video thumnail size trick/hack courtesy of the following gist:
 * <https://gist.github.com/tonY1883/a3b85925081688de569b779b4657439b>
 *
 * It is perhaps not a substitute for the YouTube API but it works in a pinch...
 * Note there are possible corner cases of false negatives, refer to the gist comments.
 *
 * Example usage:
 *
 * ```ts
 * useEffect(() => {
 *   if (video?.externalId) {
 *     const checkValid = async () => {
 *       try {
 *         const valid = await isValidYouTubeVideoId(video.externalId)
 *         setIsValid(valid)
 *       } catch (error: unknown) {
 *         setIsValid(false)
 *       }
 *     }
 *   checkValid()
 *   }
 * }, [video])
 * ```
 *
 * @see getYouTubeThumbUrl
 */
export const isValidYouTubeVideoId = async (videoId: string): Promise<boolean> => {
  const thumbWidth = await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img.width)
    img.onerror = reject
    img.src = getYouTubeThumbUrl(videoId, YouTubeVideoQuality.MED)
  })

  // if a video exists the medium quality thumb is 320px wide
  // if a video doesn't exist youtube returns a default thumb that's 120px wide
  return thumbWidth === 320
}
