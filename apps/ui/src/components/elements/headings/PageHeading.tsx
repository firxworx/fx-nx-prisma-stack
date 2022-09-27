import clsx from 'clsx'
import { Spinner } from '../feedback/Spinner'

export interface PageHeadingProps {
  subHeading?: string
  /** extra margins are suited good for cases where forms follow a heading; default is 'standard'. */
  bottomMargin?: 'standard' | 'extra'
  showLoadingSpinner?: boolean
  appendClassName?: string
}

/**
 * Responsive page heading that renders an h1 with text size and margins set.
 */
export const PageHeading: React.FC<React.PropsWithChildren<PageHeadingProps>> = ({
  subHeading,
  bottomMargin = 'standard',
  showLoadingSpinner,
  appendClassName,
  children,
}) => {
  return (
    <div
      className={clsx('flex justify-start items-center', {
        'mb-4 sm:mb-6 md:mb-8': bottomMargin === 'standard',
        'mb-6 sm:mb-8 md:mb-10': bottomMargin === 'extra',
      })}
    >
      <div>
        <h1
          className={clsx(
            'text-2xl sm:text-3xl font-semibold tracking-tight',
            'text-brand-primary-darkest',
            appendClassName,
          )}
        >
          {children}
        </h1>
        {typeof subHeading === 'string' && (
          <div className="text-xl sm:text-2xl pl-0.5 tracking-tight text-brand-primary-darker">
            {subHeading || <>&nbsp;</>}
          </div>
        )}
      </div>
      <div>
        {!!showLoadingSpinner && (
          <Spinner size="sm" color="brand" appendClassName={clsx({ 'ml-4': !subHeading, 'ml-6': !!subHeading })} />
        )}
      </div>
    </div>
  )
}
