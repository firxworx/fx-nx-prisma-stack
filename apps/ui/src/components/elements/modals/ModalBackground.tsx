import React from 'react'
import { Transition } from '@headlessui/react'

/**
 * Modal/pop-up background with a transition that renders a semi-opaque background.
 * This component is a dependency of `ModalContainer`.
 *
 * @see ModalContainer
 * @see ModalContextProvider
 */
export const ModalBackground: React.FC<{ in?: boolean; onExited?: () => void }> = ({ in: show, onExited }) => {
  return (
    <Transition
      appear
      show={!!show}
      afterLeave={onExited}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="fixed inset-0 z-50 transition-opacity bg-slate-500 bg-opacity-75"
      aria-hidden="true"
    />
  )
}
