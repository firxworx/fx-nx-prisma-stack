import type { NextPage } from 'next'
import { PageHeading } from '../components/elements/headings/PageHeading'

const CustomError404Page: NextPage = () => {
  return (
    <div className="p-8 rounded-md bg-red-300">
      <PageHeading>Error 404</PageHeading>
    </div>
  )
}

export default CustomError404Page
