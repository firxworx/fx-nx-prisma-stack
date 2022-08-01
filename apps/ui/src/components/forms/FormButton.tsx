import clsx from 'clsx'
import { useFormContext } from 'react-hook-form'
import { Spinner } from '../elements/Spinner'

export interface FormButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  type: React.ComponentPropsWithoutRef<'button'>['type'] // require explicit type
}

export const FormButton: React.FC<FormButtonProps> = ({ children, ...props }) => {
  const {
    formState: { isSubmitting },
  } = useFormContext()

  const isDisabled = (props.disabled ?? false) || isSubmitting

  return (
    <button
      className={clsx('inline-flex items-center justify-center px-4 py-2 rounded-md bg-sky-700 text-white', {
        'animate-pulse': isSubmitting,
      })}
      disabled={isDisabled}
    >
      {isSubmitting ? <Spinner size="sm" appendClassName="mr-1" /> : children}
    </button>
  )
}
