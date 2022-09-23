import clsx from 'clsx'
import { type ModalBodyContextProps, type ModalBodyProps, MODAL_LABELS } from '../ModalBody'

export interface ModalBodyActionsProps
  extends Pick<ModalBodyProps, 'action' | 'actionLabel'>,
    Pick<ModalBodyContextProps, 'hideModal'> {}

export const ModalBodyActions: React.FC<ModalBodyActionsProps> = ({ action, actionLabel, hideModal }) => {
  return (
    <div className="mt-5 sm:mt-6">
      {action ? (
        <button
          type="button"
          className={clsx(
            'inline-flex justify-center w-full px-4 py-2 rounded-md shadow-sm',
            'text-base sm:text-sm font-medium text-white border border-transparent',
            'bg-action-primary hover:bg-action-primary-darker',
            'fx-focus-ring-form',
          )}
          onClick={(): void => {
            action()
            hideModal()
          }}
        >
          {actionLabel || MODAL_LABELS.OK}
        </button>
      ) : (
        <button
          type="button"
          className={clsx(
            'inline-flex justify-center w-full px-4 py-2 rounded-md shadow-sm',
            'text-base sm:text-sm font-medium text-white border border-transparent',
            'bg-action-primary hover:bg-action-primary-darker',
            'fx-focus-ring-form',
          )}
          onClick={hideModal}
        >
          {actionLabel || MODAL_LABELS.OK}
        </button>
      )}
    </div>
  )
}
