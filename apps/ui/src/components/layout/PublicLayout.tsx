import { PropsWithChildren } from 'react'

export const PublicLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <main className="bg-slate-300">
      <h1 className="text-2xl">Public Layout</h1>
      <div>{children}</div>
    </main>
  )
}
