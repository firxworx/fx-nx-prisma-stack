import type { NextPage } from 'next'
import { PageHeading } from '../../../components/elements/headings/PageHeading'

import { useVideoGroupsQuery } from '../../../api/hooks/video-groups'
import { Spinner } from '../../../components/elements/feedback/Spinner'
import Link from 'next/link'
import clsx from 'clsx'
import { useModalContext } from '../../../context/ModalContextProvider'
import { ModalVariant } from '../../../components/elements/modals/ModalBody'
import { VideoGroupMultiForm } from '../../../components/features/videos/VideoGroupMultiForm'
import { ActionButton } from '../../../components/elements/inputs/ActionButton'
import { PlusIcon } from '@heroicons/react/20/solid'

export const VideoGroupsPage: NextPage = (_props) => {
  const { data, refetch, isSuccess, isLoading, isFetching, isError } = useVideoGroupsQuery()

  const [showModal] = useModalContext(
    {
      title: 'Add Video Group',
      // actionLabel: 'Save',
      // action: () => alert('saved'),
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoGroupMultiForm
        create={{
          onSuccess: () => {
            hideModal()
            refetch()
          },
        }}
      />
    ),
  )

  return (
    <div>
      <div className="flex">
        <PageHeading>Video Groups</PageHeading>
        {isFetching && <Spinner size="sm" />}
      </div>
      <div className="flex justify-end mb-4">
        <ActionButton variant="outline" onClick={showModal}>
          <PlusIcon className="h-5 w-5 mr-1" />
          <span>Add Video Group</span>
        </ActionButton>
      </div>
      <div>
        {isError && <p>Error fetching data</p>}
        {isLoading && <Spinner />}
        {isSuccess && !!data?.length && (
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {data?.map((vg) => (
              <Link key={vg.uuid} href={`/app/video-groups/${vg.uuid}`}>
                <a
                  className={clsx(
                    'group flex flex-col justify-start p-4 border-2 rounded-md',
                    'border-slate-200 hover:border-action-primary',
                    'text-action-primary hover:text-action-primary-darker',
                    'bg-slate-50 hover:bg-sky-50',
                    'transition-colors',
                  )}
                >
                  <div className="flex justify-between items-center flex-auto">
                    <div className="flex flex-col pr-4 flex-1">
                      <span className="block mb-1 text-base leading-snug">{vg.name}</span>
                      <span className="block text-sm leading-4 text-action-primary/80">{vg.description}</span>
                    </div>
                    <div
                      className={clsx(
                        'flex justify-center items-center py-1 px-3 border-2 rounded-md',
                        'text-sm transition-colors border-slate-200 bg-sky-100',
                        'group-hover:border-action-primary/50',
                      )}
                    >
                      {vg.videos.length}
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
        {isSuccess && !data?.length && (
          <div className="flex items-center border-2 border-dashed rounded-md p-4">
            <div className="text-slate-600">No video groups found.</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoGroupsPage
