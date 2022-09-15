import type { NextPage } from 'next'
import { PageHeading } from '../components/elements/headings/PageHeading'

/**
 * About page.
 */
export const AboutPage: NextPage = (_props) => {
  return (
    <>
      <PageHeading>About</PageHeading>
      <p>All about us and stuff stuff</p>
    </>
  )
}

export default AboutPage
