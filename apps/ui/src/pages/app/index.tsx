import type { NextPage } from 'next'
import clsx from 'clsx'

import { BsJoystick } from 'react-icons/bs'

import { Spinner } from '@firx/react-feedback'
import { PageHeading } from '../../components/elements/headings/PageHeading'
import { useBoxProfilesQuery } from '../../api/hooks/box-profiles'
import { Heading } from '../../components/elements/headings/Heading'
import { NavLink } from '../../components/elements/inputs/NavLink'

const OLIVIA_PARTY_BOX_URL = 'https://olivia.party/box'

export const AppIndexPage: NextPage = (_props) => {
  const { data, isSuccess, isLoading, isError } = useBoxProfilesQuery()

  return (
    <div>
      <PageHeading>Olivia Party</PageHeading>
      <Heading type="h3">Box Profiles</Heading>
      <div>
        {isError && <p>error fetching data</p>}
        {isLoading && <Spinner />}
        {isSuccess && !!data?.length && (
          <>
            <div className="">
              <div className="grid grid-cols-1">
                {data?.map((box) => (
                  <div
                    key={box.uuid}
                    className={clsx(
                      'flex items-center justify-center flex-wrap p-4 sm:p-6 overflow-hidden',
                      'border-x border-y first:rounded-t-md first:border-t first:border-b-0 last:rounded-b-md last:border-t-0 last:border-b',
                      'text-brand-primary-darkest border-slate-200',
                    )}
                  >
                    <BsJoystick
                      className="hidden xs:block h-12 w-12 pr-4 sm:pr-6 text-brand-primary"
                      aria-hidden="true"
                    />
                    <div className="flex flex-col flex-1">
                      <div className="font-medium">{box.name}</div>
                      <div>
                        {OLIVIA_PARTY_BOX_URL}/{box.urlCode}
                      </div>
                    </div>
                    <div className="flex space-x-4 font-medium pl-4 sm:pl-6">
                      <NavLink href={`/app/${box.uuid}/videos`}>Manage Videos</NavLink>
                      <div className="" onClick={(): void => alert('not implemented yet!')}>
                        Manage Phrases
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {isSuccess && !data?.length && (
          <div className="flex items-center border-2 border-dashed rounded-md p-4">
            <div className="text-slate-600">No Box Profiles found.</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppIndexPage
