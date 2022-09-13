import React, { useRef, useState, useEffect } from 'react'
import clsx from 'clsx'
import { Transition } from '@headlessui/react'
import { useId } from '@reach/auto-id'
import FocusTrap from 'focus-trap-react'

import { CheckIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

/**
 * Enum of modal variants:
 *
 * DEFAULT - default modal
 * ALERT - no close button ('x') + click-outside to close is disabled
 * SUCCESS - display green check icon
 * WARN - display yellow warning icon
 * ERROR - display red warning icon
 * BLANK - blank modal with close 'x' (ignores other props; assumes content includes any required actions)
 *
 * @see ModalContextProvider
 */
export enum ModalVariant {
  DEFAULT = 'DEFAULT',
  ALERT = 'ALERT',
  SUCCESS = 'SUCCESS',
  WARN = 'WARN',
  ERROR = 'ERROR',
  BLANK = 'BLANK',
}

export interface ModalBodyProps {
  title?: string
  variant?: ModalVariant
  action?: () => void
  actionLabel?: string
}

const LABELS = {
  OK: 'OK',
  CLOSE: 'Close',
}

/**
 * Modal/pop-over body as provided via the `useModalContext()` hook.
 *
 * The implementation provides several pre-styled variants
 *
 * @see ModalContextProvider
 */
export const ModalBody: React.FC<
  React.PropsWithChildren<
    ModalBodyProps & {
      show: boolean
      hideModal: () => void
      onExited: () => void
    }
  >
> = ({ title, variant = ModalVariant.DEFAULT, action, actionLabel, show, onExited, hideModal, children }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // for transition performance: only add the box-shadow to modal after it has transitioned
  const [hasEntered, setHasEntered] = useState(false)

  // bug workaround: delay activation of focus trap to avoid interfering with Transition
  const [focusActive, setFocusActive] = useState(false)
  useEffect(() => {
    setTimeout(() => setFocusActive(true), 0)
  }, [])

  // isomorphic-friendly id for aria/a11y purposes @todo revise to use the new React 18+ useId hook
  const modalId = useId()

  // bug warning (2021-04):
  // Transition component's `beforeEnter` may double-fire on first use on a fresh page load when used with show=true, appear=true
  // need to verify if this is still a concern w/ the latest version 2022-09

  if (action && typeof action !== 'function') {
    throw new Error('Modal action must be a function')
  }

  if (variant === ModalVariant.BLANK && (title !== undefined || !!action || actionLabel !== undefined)) {
    console.warn('Modal variant BLANK is ignoring provided title and action-related props')
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center pointer-events-auto sm:block sm:p-0">
        {/* prettier-ignore */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <Transition
          appear
          show={!!show}
          afterEnter={() => setTimeout(() => setHasEntered(true), 5)}
          afterLeave={onExited}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-12 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-12 sm:scale-95"
          className="inline-block text-left align-bottom transition-all transform sm:my-8 sm:align-middle sm:max-w-sm sm:w-full"
        >
          <FocusTrap
            active={focusActive}
            focusTrapOptions={{
              fallbackFocus: () => {
                if (!modalRef.current) {
                  throw new Error('Container ref not set on modal body')
                }
                return modalRef.current
              },
              clickOutsideDeactivates: variant !== ModalVariant.ALERT,
              onDeactivate: hideModal,
            }}
          >
            <div
              ref={modalRef}
              tabIndex={-1}
              className={clsx('px-4 pt-5 pb-4 overflow-hidden bg-white rounded-lg sm:p-6 focus:outline-none', {
                ['shadow-modal']: hasEntered,
              })}
              role="dialog"
              aria-modal
              aria-labelledby={variant !== ModalVariant.BLANK ? modalId : undefined}
            >
              {variant !== ModalVariant.ALERT && (
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className="text-slate-400 bg-white rounded-md hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-100"
                    onClick={hideModal}
                    tabIndex={-1}
                  >
                    <span className="sr-only">{LABELS.CLOSE}</span>
                    <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
              )}
              <div>
                {variant === ModalVariant.BLANK ? (
                  <>{children}</>
                ) : (
                  <>
                    <div>
                      {(variant === ModalVariant.SUCCESS ||
                        variant === ModalVariant.WARN ||
                        variant === ModalVariant.ERROR) && (
                        <div
                          className={clsx(
                            'flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full sm:mb-5',
                            {
                              ['bg-green-100']: variant === ModalVariant.SUCCESS,
                              ['bg-yellow-100']: variant === ModalVariant.WARN,
                              ['bg-red-100']: variant === ModalVariant.ERROR,
                            },
                          )}
                        >
                          {variant === ModalVariant.SUCCESS && <CheckIcon className="w-6 h-6 text-green-600" />}
                          {variant === ModalVariant.WARN && (
                            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                          )}
                          {variant === ModalVariant.ERROR && <ExclamationTriangleIcon className="w-6 h-6 text-error" />}
                        </div>
                      )}
                      <div className="text-center">
                        <h3 className="text-lg font-medium leading-6 text-slate-900" id={modalId}>
                          {title}
                        </h3>
                        <div className="mt-2 text-base text-slate-500">{children}</div>
                      </div>
                    </div>
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
                          onClick={() => {
                            action()
                            hideModal()
                          }}
                        >
                          {actionLabel || LABELS.OK}
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
                          {actionLabel || LABELS.OK}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </FocusTrap>
        </Transition>
      </div>
    </div>
  )
}
