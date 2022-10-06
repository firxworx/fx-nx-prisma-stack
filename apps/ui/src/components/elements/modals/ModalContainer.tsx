import React, { isValidElement, useEffect } from 'react'
import { TransitionGroup } from 'react-transition-group'

import { useScrollbarWidth } from '@firx/react-hooks'
import { ModalBackground } from './ModalBackground'

const ScrollLock: React.FC<{ modalCount: number }> = ({ modalCount }) => {
  const scrollbarWidth = useScrollbarWidth()

  useEffect(() => {
    if (modalCount && document.body.style.overflow === '') {
      document.body.style.overflow = 'hidden'

      if (scrollbarWidth) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = '0'
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = '0'
    }
  }, [modalCount, scrollbarWidth])

  return <></>
}

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
      <ScrollLock modalCount={children.length} />
      <TransitionGroup component={null}>{children.length ? <ModalBackground /> : null}</TransitionGroup>
      <TransitionGroup component={null}>
        {children.map((modalItem) => {
          if (!isValidElement(modalItem)) {
            throw new Error('ModalContainer requires valid React.ReactElement')
          }

          return modalItem
        })}
      </TransitionGroup>
    </>
  )
}
