import type { NextPage } from 'next'
import Link from 'next/link'

export const AppIndexPage: NextPage = (_props) => {
  return (
    <div>
      <h2 className="text-lg mt-8">App Index / Dashboard Page</h2>
      <Link href="/app/settings">
        <a className="mt-8 text-blue-700">Go to Protected Settings Page</a>
      </Link>
    </div>
  )
}

export default AppIndexPage
