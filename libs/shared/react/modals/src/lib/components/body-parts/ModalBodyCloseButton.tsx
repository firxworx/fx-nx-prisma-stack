import { XMarkIcon } from '@heroicons/react/24/outline'
import { ModalBodyContextProps, MODAL_LABELS } from '../ModalBody'

export interface ModalBodyCloseButtonProps extends Pick<ModalBodyContextProps, 'hideModal'> {}

export const ModalBodyCloseButton: React.FC<ModalBodyCloseButtonProps> = ({ hideModal }) => {
  return (
    <button
      type="button"
      className="text-slate-400 bg-white rounded-md hover:text-slate-500 fx-focus-ring-form"
      onClick={hideModal}
      tabIndex={-1}
    >
      <span className="sr-only">{MODAL_LABELS.CLOSE}</span>
      <XMarkIcon className="w-6 h-6" aria-hidden="true" />
    </button>
  )
}
