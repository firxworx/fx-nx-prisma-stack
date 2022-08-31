import type { NextPage } from 'next'

import { NavLink } from '../../components/elements/inputs/NavLink'

export const AppIndexPage: NextPage = (_props) => {
  return (
    <div>
      <h2 className="text-lg">App Index / Dashboard Page</h2>
      <div className="space-x-4">
        <NavLink href="/app/settings" className="mt-8">
          Go to Settings Page (Auth-Only)
        </NavLink>
        <NavLink href="/about" className="mt-8">
          Go to About Page (Public)
        </NavLink>
      </div>
    </div>
  )
}

export default AppIndexPage
