import clsx from 'clsx'
import Link from 'next/link'

export interface FooterProps {
  contentConstraintStyle: string
  containerXPaddingStyle: string
}

/**
 * Footer for structure layout.
 */
export const Footer: React.FC<FooterProps> = ({ contentConstraintStyle, containerXPaddingStyle }) => {
  return (
    <footer className="border-t-2 bg-slate-100 border-slate-200">
      <div
        className={clsx(
          'flex flex-col sm:flex-row items-center justify-center w-full mx-auto text-center py-4',
          'text-sm font-medium leading-none text-brand-slate-800',
          contentConstraintStyle,
          containerXPaddingStyle,
        )}
      >
        <div>
          <span>&copy; {new Date().getFullYear()} </span>
          <Link href={process.env.NEXT_PUBLIC_PROJECT_ORG_CONTACT_URL ?? '/'}>
            <a className="hover:underline">{process.env.NEXT_PUBLIC_PROJECT_ORG_NAME}</a>
          </Link>
        </div>
        <div>
          <span className="hidden sm:inline-block mx-1">&bull;</span>
          <span>{process.env.NEXT_PUBLIC_PROJECT_ORG_ADDRESS}</span>
        </div>
      </div>
    </footer>
  )
}
