import React, { useCallback } from 'react'

import type { NextPage } from 'next'

import { useRouter } from 'next/router'
import { useVideoGroupQuery } from '../../../../api/hooks/video-groups'
import { Spinner } from '../../../../components/elements/feedback/Spinner'
import { getRouterParamValue } from '../../../../lib/router'
import { PageHeading } from '../../../../components/elements/headings/PageHeading'
import { Heading } from '../../../../components/elements/headings/Heading'
import { useIsMounted } from '@firx/react-hooks'
import { VideoGroupForm } from '../../../../components/features/videos/VideoGroupForm'
import { ApiParentContext } from '../../../../api/types/common.types'
import { BoxProfileChildQueryContext } from '../../../../types/box-profiles.types'
import { FormContainer } from '../../../../components/elements/forms/FormContainer'

// @todo complete implementation of WIP video action galler component
// import { VideoActionGallery } from '../../../../../components/features/videos/VideoActionGallery'

export interface VideoGroupDynamicPageProps {}

export const VideoGroupDynamicPage: NextPage<VideoGroupDynamicPageProps> = () => {
  const isMounted = useIsMounted()
  const { push: routerPush, query: routerQuery } = useRouter()

  const boxProfileUuid = getRouterParamValue(routerQuery, 'box')
  const videoGroupUuid = getRouterParamValue(routerQuery, 'videoGroup')

  const parentContext: ApiParentContext<BoxProfileChildQueryContext>['parentContext'] = {
    boxProfileUuid,
  }

  const {
    data: videoGroup,
    isSuccess,
    isLoading,
    isFetching,
    isError,
  } = useVideoGroupQuery({ parentContext, uuid: videoGroupUuid })

  const onSaveRedirectHandler = useCallback((): void => {
    if (isMounted()) {
      routerPush(`/app/${boxProfileUuid}/videos`)
    }
  }, [routerPush, isMounted, boxProfileUuid])

  return (
    <>
      <PageHeading subHeading={videoGroup?.name ?? ''} showLoadingSpinner={isFetching}>
        Video Group
      </PageHeading>
      {isError && <p className="text-error">Error fetching data</p>}
      {isLoading && <Spinner />}
      {isSuccess && !!videoGroup && (
        <>
          <FormContainer>
            <Heading type="h3">Edit Group</Heading>
            <VideoGroupForm
              parentContext={parentContext}
              mutate={{ data: videoGroup, onSuccess: onSaveRedirectHandler }}
            />
          </FormContainer>
          {/* WIP VideoGallery Component */}
          {/* <VideoActionGallery videos={videoGroup.videos} /> */}
        </>
      )}
    </>
  )
}

export default VideoGroupDynamicPage
