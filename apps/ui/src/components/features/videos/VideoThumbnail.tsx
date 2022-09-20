import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { getYouTubeThumbUrl, YouTubeVideoQuality } from 'apps/ui/src/lib/videos/youtube'
import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Spinner } from '../../elements/feedback/Spinner'

export interface VideoThumbnailProps {
  externalId: string
  // platform: VideoPlatform // @future support additional video platforms
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ externalId }) => {
  const imgRef = useRef<HTMLImageElement>(null)

  const [isValid, setIsValid] = useState<boolean | undefined>(undefined)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)

  console.log('[isValid, isLoaded, isError]', [isValid, isLoaded, isError])

  const handleImageLoaded = useCallback(() => {
    setIsLoaded(true)

    // the requested youtube medium quality thumbnail is 320px wide (refer to `src` prop of img tag below)
    // if a video does not exist (404) then a smaller error thumbnail is returned
    if (imgRef.current?.width && imgRef.current.width === 320) {
      setIsValid(true)
    } else {
      setIsValid(false)
    }
  }, [])

  const handleImageError = useCallback((error: unknown) => {
    setIsError(true)

    console.error(error)
  }, [])

  useEffect(() => {
    const imgElCurrent = imgRef.current

    if (imgElCurrent) {
      imgElCurrent.addEventListener('load', handleImageLoaded)
      imgElCurrent.addEventListener('error', handleImageError)

      return () => {
        imgElCurrent.removeEventListener('load', handleImageLoaded)
        imgElCurrent.removeEventListener('error', handleImageError)
      }
    }
  }, [])

  return (
    <div
      className={clsx('aspect-w-16 aspect-h-9 bg-slate-200', {
        ['animate-pulse']: !isLoaded,
      })}
    >
      {!isError && !isLoaded && isValid === undefined && (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      )}
      {(isError || isValid === false) && (
        <div className="flex items-center justify-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-slate-500" />
        </div>
      )}
      <img
        ref={imgRef}
        src={getYouTubeThumbUrl(externalId, YouTubeVideoQuality.MED)}
        alt="Video Thumbnail"
        style={isLoaded && isValid ? { display: 'inline-block' } : { display: 'none' }}
        className={clsx('object-cover', {
          ['inline-block']: isLoaded && isValid,
          ['hidden']: !isLoaded || !isValid || isError,
        })}
      />
    </div>
  )
}
