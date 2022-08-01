import type { PropsWithChildren } from 'react'

/**
 * Wrapper for structure resets z-index and defines the base flex column layout.
 */
export const Wrapper: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="h-screen z-0 flex flex-col bg-white">{children}</div>
}
