import type { PropsWithChildren } from 'react'

import { Header } from './sections/Header'
import { Footer } from './sections/Footer'
import { Content } from './sections/Content'
import { Wrapper } from './sections/Wrapper'

import type { NavigationLink } from '../../types/navigation.types'

export interface AppLayoutProps {
  navigationLinks: NavigationLink[]
}

const contentConstraintStyle = 'max-w-6xl'
const containerXPaddingStyle = 'px-4 sm:px-6 xl:px-8'
const containerYPaddingStyle = 'pt-4 pb-12 sm:pt-6 sm:pb-16'

/**
 * Responsive web application UI layout that includes a header with responsive navigation, a main content section,
 * and a footer.
 */
export const AppLayout: React.FC<PropsWithChildren<AppLayoutProps>> = ({ navigationLinks, children }) => {
  return (
    <Wrapper>
      <Header
        navigationLinks={navigationLinks}
        contentConstraintStyle={contentConstraintStyle}
        containerXPaddingStyle={containerXPaddingStyle}
      />
      <Content
        contentConstraintStyle={contentConstraintStyle}
        containerXPaddingStyle={containerXPaddingStyle}
        containerYPaddingStyle={containerYPaddingStyle}
      >
        {children}
      </Content>
      <Footer contentConstraintStyle={contentConstraintStyle} containerXPaddingStyle={containerXPaddingStyle} />
    </Wrapper>
  )
}
