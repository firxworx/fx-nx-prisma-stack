import type { PropsWithChildren } from 'react'

export const PublicLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="p-4 sm:p-8 border-2 border-dotted border-slate-200 rounded-md">
      <div>{children}</div>
    </div>
  )
}
