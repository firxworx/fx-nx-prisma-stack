import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { google, type youtube_v3 } from 'googleapis'
import { parse } from 'tinyduration'

export interface YouTubeVideoDetails {
  title: string | undefined
  description: string | undefined
  thumbnails: youtube_v3.Schema$ThumbnailDetails | undefined
  durationIso8601: string | undefined
  durationSeconds: number | undefined
}

/**
 * YouTube service that interfaces with the YouTube API v3 using an API key.
 *
 * @see https://developers.google.com/youtube/v3/docs/videos/list
 * @see {@link https://developers.google.com/youtube/v3/docs/search}
 * @see {@link https://developers.google.com/youtube/v3/docs/thumbnails }
 * @see {@link https://stackoverflow.com/questions/72171224/download-file-from-internet-and-send-it-to-s3-as-stream }
 * @see {@link https://www.twilio.com/blog/parse-iso8601-duration-javascript}
 */
@Injectable()
export class YouTubeService {
  private readonly logger = new Logger(this.constructor.name)

  private youtube: youtube_v3.Youtube

  constructor() {
    this.youtube = google.youtube({ auth: process.env.GOOGLE_API_KEY, version: 'v3' })
  }

  private convertIso8601DurationToSeconds(input: string): number {
    // when the JS Temporal API is available this should become easy e.g.
    // const d = Temporal.Duration.from('P4DT12H30M5S')
    // using https://www.npmjs.com/package/tinyduration for now

    const pd = parse(input)

    if (!!pd.years || !!pd.months) {
      this.logger.error(`Unexpected erroneous duration parsed from YouTube API response, input: ${input}`)
      throw new InternalServerErrorException()
    }

    return (pd?.seconds ?? 0) + (pd?.minutes ?? 0) * 60 + (pd?.hours ?? 0) * 60 * 60 + (pd?.days ?? 0) * 60 * 60 * 24
  }

  async fetchVideoDetails(videoId: string): Promise<YouTubeVideoDetails | undefined> {
    try {
      // contentDetails contains the duration
      const list = await this.youtube.videos.list({
        id: [videoId],
        part: ['snippet,contentDetails,statistics'],
      })

      // thumbnails are object with keys e.g. default, medium, standard, high and each of those has url + width + height

      if (!Array.isArray(list.data.items) || (Array.isArray(list.data.items) && list.data.items.length === 0)) {
        return undefined
      }

      if (list.data.items.length > 1) {
        this.logger.error(`Unexpected response from YouTube Data API: ${JSON.stringify(list)}`)
        throw new InternalServerErrorException()
      }

      const [item] = list.data.items

      return {
        title: item.snippet?.title ?? undefined,
        description: item.snippet?.description ?? undefined,
        thumbnails: item.snippet?.thumbnails,
        durationIso8601: item.contentDetails?.duration ?? undefined,
        durationSeconds: item.contentDetails?.duration
          ? this.convertIso8601DurationToSeconds(item.contentDetails.duration)
          : undefined,
      }
    } catch (error: unknown) {
      this.logger.error(error)
      throw error
    }
  }
}
