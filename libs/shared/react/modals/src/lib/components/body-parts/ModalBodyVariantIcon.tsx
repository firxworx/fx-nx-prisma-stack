import clsx from 'clsx'
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { type ModalBodyProps, ModalVariant } from '../ModalBody'

export interface ModalBodyVariantIconProps extends Pick<ModalBodyProps, 'variant'> {}

/**
 * Conditionally render a colored icon if the modal `variant` provided via props is `SUCCESS`, `WARN`, or `ERROR`.
 */
export const ModalBodyVariantIcon: React.FC<ModalBodyVariantIconProps> = ({ variant }) => {
  if (!variant || ![ModalVariant.SUCCESS, ModalVariant.WARN, ModalVariant.ERROR].includes(variant)) {
    return null
  }

  return (
    <div
      className={clsx('flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full sm:mb-5', {
        ['bg-green-100']: variant === ModalVariant.SUCCESS,
        ['bg-yellow-100']: variant === ModalVariant.WARN,
        ['bg-red-100']: variant === ModalVariant.ERROR,
      })}
    >
      {variant === ModalVariant.SUCCESS && <CheckIcon className="w-6 h-6 text-green-600" aria-hidden="true" />}
      {variant === ModalVariant.WARN && (
        <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" aria-hidden="true" />
      )}
      {variant === ModalVariant.ERROR && <ExclamationTriangleIcon className="w-6 h-6 text-error" aria-hidden="true" />}
    </div>
  )
}
