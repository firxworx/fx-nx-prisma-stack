import clsx from 'clsx'
import { NavLink } from '../../elements/inputs/NavLink'

export interface FooterProps {}

const footerClassName = clsx(
  'flex flex-col sm:flex-row items-center justify-center w-full mx-auto text-center py-4',
  'text-xs font-normal leading-none text-brand-slate-800',
  'fx-layout-max-width fx-layout-padding-x',
)

/**
 * Footer for structure layout.
 */
export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="border-t-2 bg-slate-100 border-slate-200">
      <div className={footerClassName}>
        {process.env.NEXT_PUBLIC_PROJECT_ORG_CONTACT_URL && process.env.NEXT_PUBLIC_PROJECT_ORG_NAME && (
          <div>
            <span>&copy; {new Date().getFullYear()} </span>
            <NavLink href={process.env.NEXT_PUBLIC_PROJECT_ORG_CONTACT_URL}>
              {process.env.NEXT_PUBLIC_PROJECT_ORG_NAME}
            </NavLink>
          </div>
        )}
        {process.env.NEXT_PUBLIC_PROJECT_ORG_ADDRESS && (
          <div>
            <span className="hidden sm:inline-block mx-1">&bull;</span>
            <span>{process.env.NEXT_PUBLIC_PROJECT_ORG_ADDRESS}</span>
          </div>
        )}
      </div>
    </footer>
  )
}
