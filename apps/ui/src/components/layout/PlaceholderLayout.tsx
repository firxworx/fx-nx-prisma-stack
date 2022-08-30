import type { PropsWithChildren } from 'react'

import { PlaceholderHeader } from './sections/Header'
import { Footer } from './sections/Footer'
import { Content } from './sections/Content'
import { Wrapper } from './sections/Wrapper'

export interface PlaceholderLayoutProps {}

/**
 * Dummy web application UI layout that corresponds to `AppLayout` but invokes no active/dynamic hooks such
 * as for the user or session.
 *
 * Serves as a placeholder for the `AppLayout` in special-purpose states/screens such as Loading.
 *
 * @see AppLayout
 */
export const PlaceholderLayout: React.FC<PropsWithChildren<PlaceholderLayoutProps>> = ({ children }) => {
  return (
    <Wrapper>
      <PlaceholderHeader />
      <Content>{children}</Content>
      <Footer />
    </Wrapper>
  )
}
