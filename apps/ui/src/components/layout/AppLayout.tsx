import type { PropsWithChildren } from 'react'

import { Header } from './sections/Header'
import { Footer } from './sections/Footer'
import { Content } from './sections/Content'
import { Wrapper } from './sections/Wrapper'

import type { NavigationLink } from '../../types/navigation.types'

export interface AppLayoutProps {
  navigationLinks: NavigationLink[]
}

/**
 * Responsive web application UI layout that includes a header with responsive navigation, a main content section,
 * and a footer.
 */
export const AppLayout: React.FC<PropsWithChildren<AppLayoutProps>> = ({ navigationLinks, children }) => {
  return (
    <Wrapper>
      <Header navigationLinks={navigationLinks} />
      <Content>{children}</Content>
      <Footer />
    </Wrapper>
  )
}
