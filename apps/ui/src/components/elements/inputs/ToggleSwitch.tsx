import clsx from 'clsx'
import { Switch } from '@headlessui/react'

export interface ToggleSwitchProps {
  label: string
  isLoading?: boolean
  isDisabled?: boolean
  toggleState: boolean
  isLoadingAnimated?: boolean
  onToggleChange: (newValue: boolean) => void
}

interface SpinnerSvgProps {
  isVisible: boolean
}

/**
 * Small SVG-based spinner for use in `ToggleSwitch` implementation.
 */
const SpinnerSvg: React.FC<SpinnerSvgProps> = ({ isVisible = true }) => {
  return (
    <svg
      className={clsx('animate-spin h-4 w-4 text-brand-primary-darker/70', {
        ['hidden']: !isVisible,
      })}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  )
}

/**
 * Animated toggle switch component powered by @headlessui/react.
 */
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  toggleState,
  isLoading,
  isDisabled,
  isLoadingAnimated = true,
  onToggleChange,
}) => {
  return (
    <Switch
      checked={toggleState}
      disabled={isLoading || isDisabled}
      className={clsx(
        'group relative inline-flex h-6 w-11 items-center border border-transparent rounded-full',
        'fx-focus-ring-form focus:shadow-md focus:border-slate-300 transition-colors',
        {
          ['bg-brand-primary-darker/85 hover:bg-brand-primary-darker/95']: toggleState === true && !isDisabled,
          ['bg-slate-300']: toggleState === true && isDisabled,
          ['bg-slate-200 hover:bg-slate-300/75']: toggleState === false,
          ['cursor-not-allowed']: isDisabled,
          ['cursor-pointer']: !isLoading && !isDisabled,

          // delay pulse animation for additional feedback only when api connectivity is spotty
          ['animate-[pulse_2s_infinite_1.5s] cursor-default']: isLoading && !isDisabled,
        },
      )}
      onChange={onToggleChange}
    >
      <span className="sr-only">{label}</span>
      <span
        className={clsx('inline-flex items-center transform transition', {
          ['translate-x-6']: toggleState === true,
          ['translate-x-1']: toggleState === false,
        })}
      >
        <span
          className={clsx('inline-flex items-center justify-center h-4 w-4 rounded-full', {
            ['bg-white']: !isLoading,
            ['bg-slate-50']: isLoading,
          })}
        >
          <SpinnerSvg isVisible={!!isLoading && !!isLoadingAnimated} />
        </span>
      </span>
    </Switch>
  )
}
