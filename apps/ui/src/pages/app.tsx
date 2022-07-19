import type { NextPage } from 'next'
import Link from 'next/link'

export const AppPage: NextPage = (_props) => {
  return (
    <div>
      <h2 className="text-lg">WELCOME TO THE APP</h2>
      <Link href="/secret">
        <a className="mt-8 text-blue-700">Go to Another Protected Page</a>
      </Link>
    </div>
  )
}

export default AppPage
