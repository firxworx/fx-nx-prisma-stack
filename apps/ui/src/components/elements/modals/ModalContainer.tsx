import React from 'react'
import { isValidElement } from 'react'
import { TransitionGroup } from 'react-transition-group'

import { ModalBackground } from './ModalBackground'

/**
 * Container component for Modal dialogs.
 *
 * This component is not intended to be used on its own.
 * It is a dependency of `ModalContextProvider` to facilitate transitions.
 *
 * @see ModalContextProvider
 */
export const ModalContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  if (!Array.isArray(children)) {
    return null
  }

  return (
    <>
      <TransitionGroup component={null}>{children.length ? <ModalBackground /> : null}</TransitionGroup>
      <TransitionGroup component={null}>
        {children.map((modalItem) => {
          if (!isValidElement(modalItem)) {
            throw new Error('ModalContainer requires valid elements')
          }

          return modalItem
        })}
      </TransitionGroup>
    </>
  )
}
