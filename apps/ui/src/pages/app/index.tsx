import type { NextPage } from 'next'
import { PageHeading } from '../../components/elements/headings/PageHeading'

import { NavLink } from '../../components/elements/inputs/NavLink'

export const AppIndexPage: NextPage = (_props) => {
  return (
    <div>
      <PageHeading>App Index / Dashboard Page</PageHeading>
      <div className="space-x-4">
        <NavLink href="/app/settings" appendClassName="mt-8">
          Go to Settings Page (Auth-Only)
        </NavLink>
        <NavLink href="/about" appendClassName="mt-8">
          Go to About Page (Public)
        </NavLink>
      </div>
    </div>
  )
}

export default AppIndexPage
