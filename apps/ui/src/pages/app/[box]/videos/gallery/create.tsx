import React, { useCallback } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import { PageHeading } from '../../../../../components/elements/headings/PageHeading'
import { getRouterParamValue } from '../../../../../lib/router'
import { FormContainer } from '../../../../../components/elements/forms/FormContainer'
import { Heading } from '../../../../../components/elements/headings/Heading'
import { VideoForm } from '../../../../../components/features/videos/VideoForm'

export const ManageVideoCreatePage: NextPage = () => {
  const { push: routerPush, query: routerQuery } = useRouter()

  const boxProfileUuid = getRouterParamValue(routerQuery, 'box')

  const parentContext = {
    boxProfileUuid,
  }

  const onSaveRedirectHandler = useCallback(() => {
    routerPush(`/app/${boxProfileUuid}/videos/gallery`)
  }, [routerPush, boxProfileUuid])

  return (
    <>
      <PageHeading>Create Video</PageHeading>
      <FormContainer>
        <Heading type="h3">Create Video</Heading>
        <VideoForm parentContext={parentContext} create={{ onSuccess: onSaveRedirectHandler }} />
      </FormContainer>
    </>
  )
}

export default ManageVideoCreatePage
