import clsx from 'clsx'

export interface StatusPillProps {
  label: string
  level: 'good' | 'warn' | 'danger' | 'neutral'
}

export const StatusPill: React.FC<StatusPillProps> = ({ level, label }) => {
  return (
    <span
      className={clsx('px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm', {
        ['bg-green-100 text-green-800']: level === 'good',
        ['bg-yellow-100 text-yellow-800']: level === 'warn',
        ['bg-red-100 text-red-800']: level === 'danger',
        ['bg-slate-100 text-slate-600']: level === 'neutral',
      })}
    >
      {label}
    </span>
  )
}
