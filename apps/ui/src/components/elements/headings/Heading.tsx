import clsx from 'clsx'

export interface HeadingProps {
  type: 'h2' | 'h3' | 'h4'
  appendClassName?: string
}

/**
 * Responsive heading component wrapper that renders the html heading element specified via the `type` prop
 * with a standard size and bottom margin.
 */
export const Heading: React.FC<React.PropsWithChildren<HeadingProps>> = ({ type, appendClassName, children }) => {
  const commonClassName = 'mb-2 text-brand-primary-darkest'

  switch (type) {
    case 'h2': {
      return (
        <h2 className={clsx('text-xl sm:text-2xl font-semibold tracking-tight', commonClassName, appendClassName)}>
          {children}
        </h2>
      )
    }
    case 'h3': {
      return (
        <h3 className={clsx('text-lg font-normal tracking-tight sm:text-xl', commonClassName, appendClassName)}>
          {children}
        </h3>
      )
    }
    case 'h4': {
      return <h4 className={clsx('text-base font-normal sm:text-lg', commonClassName, appendClassName)}>{children}</h4>
    }
    default: {
      throw new Error(`Unimplemented Heading type: '${type}'`)
    }
  }
}
