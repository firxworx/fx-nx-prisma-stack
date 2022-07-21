import type { PropsWithChildren } from 'react'

export const PublicLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="bg-slate-200 p-8 rounded-md">
      <h1 className="text-2xl">Public Layout</h1>
      <div>{children}</div>
    </div>
  )
}
