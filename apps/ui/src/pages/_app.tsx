import { useState } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import '../styles/tailwind.css'

import { ErrorBoundary } from '../components/layout/ErrorBoundary'
import { SessionLoadingScreen } from '../components/layout/SessionLoadingScreen'
import { AppLayout } from '../components/layout/AppLayout'
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout'
import { PublicLayout } from '../components/layout/PublicLayout'
import { SessionContextProvider } from '../context/SessionContextProvider'

const PUBLIC_ROUTES_WHITELIST = ['/', '/sign-in']

const PUBLIC_NAV_LINKS = [{ title: 'Sign-In', href: '/sign-in' }]
const AUTHENTICATED_NAV_LINKS = [
  { title: 'App', href: '/app' },
  { title: 'Videos', href: '/app/videos' },
]

const isPublicRoute = (routerPath: string) =>
  routerPath === '/'
    ? true
    : PUBLIC_ROUTES_WHITELIST.concat(['/500', '/404']).some((route) =>
        route === '/' ? false : routerPath.startsWith(route),
      )

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
              <AppLayout navigationLinks={isSessionReady ? AUTHENTICATED_NAV_LINKS : PUBLIC_NAV_LINKS}>
                {isPublicRoute(router.asPath) ? (
                  <PublicLayout>
                    <Component {...pageProps} />
                  </PublicLayout>
                ) : isSessionReady ? (
                  <AuthenticatedLayout>
                    {/* autherrorlistener, sessiontimer, etc */}
                    <Component {...pageProps} />
                  </AuthenticatedLayout>
                ) : (
                  <SessionLoadingScreen />
                )}
              </AppLayout>
            )}
          </SessionContextProvider>
          {/* ReactQueryDevtools is only included in bundles when NODE_ENV === 'development' */}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ErrorBoundary>
    </>
  )
}

export default CustomApp
