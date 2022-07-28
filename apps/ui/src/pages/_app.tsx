import type { AppProps } from 'next/app'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import '../styles/tailwind.css'
import { ErrorBoundary } from '../components/layout/ErrorBoundary'
import { SessionContextProvider } from '../context/SessionContextProvider'
import { ProtectedLayout } from '../components/layout/ProtectedLayout'
import { PublicLayout } from '../components/layout/PublicLayout'
import { SessionLoadingScreen } from '../components/layout/SessionLoadingScreen'

import { AppLayout } from '../components/layout/AppLayout'
import { useState } from 'react'

const PUBLIC_ROUTES = ['/', '/sign-in']

const PUBLIC_NAVIGATION_LINKS = [{ title: 'Sign-In', href: '/sign-in' }]
const AUTH_NAVIGATION_LINKS = [
  { title: 'App', href: '/app' },
  { title: 'Secret', href: '/secret' },
]

const isPublicRoute = (routerPath: string) =>
  routerPath === '/' ? true : PUBLIC_ROUTES.some((route) => (route === '/' ? false : routerPath.startsWith(route)))

// prettier-ignore - preserve AppProps typing
function CustomApp({ Component, pageProps, router }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content={process.env.NEXT_PUBLIC_SITE_META_DESCRIPTION} key="description" />
        <title>{process.env.NEXT_PUBLIC_SITE_TITLE}</title>
      </Head>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SessionContextProvider>
            {(isSessionReady) => (
              <AppLayout navigationLinks={isSessionReady ? AUTH_NAVIGATION_LINKS : PUBLIC_NAVIGATION_LINKS}>
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
          {/* note: by default ReactQueryDevtools is only included in bundles when NODE_ENV is 'development' */}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ErrorBoundary>
    </>
  )
}

export default CustomApp
