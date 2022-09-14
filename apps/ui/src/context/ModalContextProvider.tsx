import React, { useRef, useState, useEffect } from 'react'
import { useModal, ModalProvider as ReactModalHookProvider } from 'react-modal-hook'

import { ModalBody, ModalBodyProps } from '../components/elements/modals/ModalBody'
import { ModalContainer } from '../components/elements/modals/ModalContainer'

/**
 * React hook that returns an array containing functions to show and hide a modal.
 *
 * The parent component tree (e.g. `pages/_app.tsx`) must be wrapped by `ModalContextProvider` as exported
 * from this file.
 *
 * The `showModal()` function accepts options as the first argument and the modal contents as the second argument.
 * Supported modal content is a function or a `React.ReactElement`.
 *
 * Usage (inside a function component):
 *
 * ```ts
 * const [showModal] = useModalContext({ title: 'hello' }, <div>Hello</div>)
 *
 * return (
 *  <button onClick={showModal}>show modal</button>
 * )
 * ```
 *
 * The `hideModal()` function is also optionally available via render-prop to the modal contents:
 *
 * ```ts
 * const [showModal] = useModalContext(
 *  { title: 'hello' },
 *  (hideModal) => (<div><button onClick={hideModal}>close this modal</button></div>)
 * )
 * ```
 *
 * @see ModalContextProvider
 * @see ModalBody
 */
export function useModalContext(
  modalBodyProps: ModalBodyProps,
  contents: React.ReactElement | ((hideModal: () => void) => React.ReactElement),
  refreshDeps?: unknown[],
) {
  const modalBodyPropsRef = useRef(modalBodyProps)
  modalBodyPropsRef.current = modalBodyProps

  const contentsRef = useRef(contents)
  contentsRef.current = contents

  const [showModal, hideModal] = useModal(
    // props `in` and `onExited ` are injected by TransitionGroup (imported from react-transition-group)
    ({ in: show, onExited }) => {
      return (
        <ModalBody {...modalBodyPropsRef.current} show={show} onExited={onExited} hideModal={hideModal}>
          {typeof contentsRef.current === 'function' ? contentsRef.current(hideModal) : contentsRef.current}
        </ModalBody>
      )
    },
    refreshDeps, // refresh modal vs. declared dependencies
  )

  return [showModal, hideModal]
}

/**
 * Modal context provider.
 *
 * Usage:
 * Wrap parent level of component tree with `<ModalContextProvider>...</ModalContextProvider>`
 * to enable use of the `useModalContext()` in function components.
 */
export const ModalContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  useEffect(() => setContainer(containerRef.current), [])

  return (
    <>
      <ReactModalHookProvider container={container ?? undefined} rootComponent={ModalContainer}>
        {children}
      </ReactModalHookProvider>
      <div ref={containerRef} />
    </>
  )
}
