import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import { PageHeading } from '../../../components/elements/headings/PageHeading'

export interface ManageIndexPageProps {}

export const ManageIndexPage: NextPage<ManageIndexPageProps> = () => {
  const { query } = useRouter()

  return (
    <div>
      <PageHeading>Manage Box Index Page</PageHeading>
      <div>{query['box']}</div>
    </div>
  )
}

export default ManageIndexPage
