import React, { useRef, useState, useEffect, useId } from 'react'
import clsx from 'clsx'
import { Transition } from '@headlessui/react'
import FocusTrap from 'focus-trap-react'

import { ModalBodyVariantIcon } from './body-parts/ModalBodyVariantIcon'
import { ModalBodyActions } from './body-parts/ModalBodyActions'
import { ModalBodyCloseButton } from './body-parts/ModalBodyCloseButton'

/**
 * Enum of modal variants:
 *
 * DEFAULT - default modal
 * FORM - title and close button but no default modal actions/button(s)
 * ALERT - no close button ('x') + click-outside-to-close is disabled
 * SUCCESS - display green check icon
 * WARN - display yellow warning icon
 * ERROR - display red warning icon
 * BLANK - blank modal with close 'x' (ignores other props; assumes content includes any required actions)
 *
 * @see ModalContextProvider
 */
export enum ModalVariant {
  DEFAULT = 'DEFAULT',
  FORM = 'FORM',
  ALERT = 'ALERT',
  SUCCESS = 'SUCCESS',
  WARN = 'WARN',
  ERROR = 'ERROR',
  BLANK = 'BLANK',
}

export interface ModalBodyProps {
  title?: string
  subtitle?: string
  variant?: ModalVariant
  action?: () => void
  actionLabel?: string
}

export interface ModalBodyContextProps {
  show: boolean
  hideModal: () => void
  onExited: () => void
}

export const MODAL_LABELS = {
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
export const ModalBody: React.FC<React.PropsWithChildren<ModalBodyProps & ModalBodyContextProps>> = ({
  title,
  subtitle,
  variant = ModalVariant.DEFAULT,
  action,
  actionLabel,
  show,
  onExited,
  hideModal,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // for performance track hasEntered to only add a box-shadow to the modal body after it has transitioned in
  const [hasEntered, setHasEntered] = useState(false)

  // bug workaround: delay activation of focus trap to avoid interfering with Transition
  const [focusActive, setFocusActive] = useState(false)
  useEffect(() => {
    setTimeout(() => setFocusActive(true), 0)
  }, [])

  // isomorphic-friendly id for aria/a11y purposes
  const headingId = useId()

  // bug warning (2021-04):
  // Transition component's `beforeEnter` may double-fire on first use on a fresh page load when used with show=true, appear=true
  // need to verify if this is still a concern w/ the latest version 2022-09

  if (action && typeof action !== 'function') {
    throw new Error('Modal action must be a function')
  }

  if (variant === ModalVariant.BLANK && (title !== undefined || !!action || actionLabel !== undefined)) {
    console.warn('Modal variant BLANK ignoring provided title and action-related props')
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        // consider min-h-full (tw) vs min-h-screen (past)
        className="flex items-center justify-center min-h-full p-4 sm:p-0 text-center pointer-events-auto"
      >
        {/* zero-width-space (&#8203;) required as layout trick -- do not allow code formatters to break the line with &#8203 */}
        {/* prettier-ignore */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <Transition
          appear
          show={!!show}
          afterEnter={(): void => {
            setTimeout(() => setHasEntered(true), 5)
          }}
          afterLeave={onExited}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-12 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-12 sm:scale-95"
          className="relative transform transition-all inline-block align-bottom sm:align-middle sm:my-8 xxs:min-w-[18rem] sm:w-full sm:max-w-xl md:max-w-2xl text-left"
        >
          <FocusTrap
            active={focusActive}
            focusTrapOptions={{
              fallbackFocus: (): HTMLDivElement => {
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
              className={clsx(
                // note: adding overflow-hidden risks hiding portions of open drop-down menus
                'p-4 sm:p-6 rounded-lg text-left bg-white focus:outline-none fx-modal-body-after-shadow',
                {
                  // add shadow to ::after w/ opacity transition (refer to '.fx-modal-body-after-shadow' in preset)
                  ['after:opacity-0']: !hasEntered,
                  ['after:opacity-100']: hasEntered,
                },
              )}
              role="dialog"
              aria-modal
              aria-labelledby={variant !== ModalVariant.BLANK ? headingId : undefined}
            >
              {variant !== ModalVariant.ALERT && (
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <ModalBodyCloseButton hideModal={hideModal} />
                </div>
              )}
              <div>
                {variant === ModalVariant.BLANK ? (
                  <>{children}</>
                ) : (
                  <>
                    <div>
                      <ModalBodyVariantIcon variant={variant} />
                      <div>
                        <h3 id={headingId} className="text-lg font-medium leading-6 text-center text-P-heading">
                          {title}
                        </h3>
                        {!!subtitle && (
                          <h4 className="mb-4 font-normal text-P-subheading italic text-center tracking-tight leading-tight">
                            {subtitle}
                          </h4>
                        )}
                        <div className="mt-4 text-base">{children}</div>
                      </div>
                    </div>
                    {(variant !== ModalVariant.FORM || action) && (
                      <ModalBodyActions action={action} actionLabel={actionLabel} hideModal={hideModal} />
                    )}
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
