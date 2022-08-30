import type { NextPage } from 'next'
import Link from 'next/link'

export const AppIndexPage: NextPage = (_props) => {
  return (
    <div>
      <h2 className="text-lg">App Index / Dashboard Page</h2>
      <div className="space-x-4">
        <Link href="/app/settings">
          <a className="mt-8 text-blue-700">Go to Settings Page (Auth-Only)</a>
        </Link>
        <Link href="/about">
          <a className="mt-8 text-blue-700">Go to About Page (Public)</a>
        </Link>
      </div>
    </div>
  )
}

export default AppIndexPage
