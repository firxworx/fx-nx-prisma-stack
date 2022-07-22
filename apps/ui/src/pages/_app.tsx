import type { AppProps } from 'next/app'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import '../styles/tailwind.css'
import { ErrorBoundary } from '../components/layout/ErrorBoundary'
import { SessionContextProvider } from '../context/SessionContextProvider'
import { ProtectedLayout } from '../components/layout/ProtectedLayout'
import { PublicLayout } from '../components/layout/PublicLayout'
import { SessionLoadingScreen } from '../components/layout/SessionLoadingScreen'

import { AppLayout } from '../components/layout/AppLayout'
import { useState } from 'react'

const PUBLIC_ROUTES = ['/', '/sign-in']
const NAVIGATION_LINKS = [
  { title: 'App', href: '/app' },
  { title: 'Secret', href: '/secret' },
  { title: 'Sign-In', href: '/sign-in' },
]

const isPublicRoute = (routerPath: string) =>
  routerPath === '/' ? true : PUBLIC_ROUTES.some((route) => (route === '/' ? false : routerPath.startsWith(route)))

// @todo - some setting in vscode/nx/prettier/? keeps _intermittently_ removing the `AppProps` type - find and fix!

function CustomApp({ Component, pageProps, router }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Web Application" key="description" />
        <title>UI</title>
      </Head>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SessionContextProvider>
            {(isSessionReady) => (
              <AppLayout navigationLinks={NAVIGATION_LINKS}>
                {isPublicRoute(router.asPath) ? (
                  <PublicLayout>
                    <Component {...pageProps} />
                  </PublicLayout>
                ) : isSessionReady ? (
                  <ProtectedLayout>
                    {/* autherrorlistener, sessiontimer, etc */}
                    <Component {...pageProps} />
                  </ProtectedLayout>
                ) : (
                  <SessionLoadingScreen />
                )}
              </AppLayout>
            )}
          </SessionContextProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </>
  )
}

export default CustomApp
