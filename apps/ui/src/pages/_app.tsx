import { useState } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ErrorBoundary } from 'react-error-boundary'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useQueryErrorResetBoundary,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import '../styles/tailwind.css'

import { authQueryKeys } from '../api/auth'
import { AuthError } from '../api/errors/AuthError.class'
import { SessionLoadingScreen } from '../components/layout/SessionLoadingScreen'
import { AppLayout } from '../components/layout/AppLayout'
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout'
import { PublicLayout } from '../components/layout/PublicLayout'
import { SessionContextProvider } from '../context/SessionContextProvider'
import { ActionButton } from '../components/elements/inputs/ActionButton'
import { PlaceholderLayout } from '../components/layout/PlaceholderLayout'

export const SIGN_IN_ROUTE = '/sign-in'

const PUBLIC_ROUTES_WHITELIST = ['/', SIGN_IN_ROUTE, '/about']

const PUBLIC_NAV_LINKS = [
  { title: 'About', href: '/about' },
  { title: 'Sign-In', href: SIGN_IN_ROUTE },
]
const AUTHENTICATED_NAV_LINKS = [
  { title: 'App', href: '/app' },
  { title: 'Videos', href: '/app/videos' },
  { title: 'About', href: '/about' },
]

const LABELS = {
  ERROR_BOUNDARY_MESSAGE: 'There was an error',
  ERROR_BOUNDARY_TRY_AGAIN_ACTION: 'Try again',
}

const isPublicRoute = (routerPath: string) =>
  routerPath === '/'
    ? true
    : PUBLIC_ROUTES_WHITELIST.concat(['/500', '/404']).some((route) =>
        route === '/' ? false : routerPath.startsWith(route),
      )

function CustomApp({ Component, pageProps, router }: AppProps) {
  const { push: routerPush } = useRouter()
  const { reset } = useQueryErrorResetBoundary()

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            suspense: false,
            // retry: true,
            // retry: (_count, error) => {
            //   return !(error instanceof AuthError || (error instanceof FetchError && error.status === 404))
            // },
            // refetchOnWindowFocus: true,
            // useErrorBoundary: true,
            useErrorBoundary: (error: unknown) => {
              return error instanceof AuthError // or e.g. return error.response?.status >= 500
            },
          },
          mutations: {
            // useErrorBoundary: false
            useErrorBoundary: (error: unknown) => {
              return error instanceof AuthError // or e.g. error.response?.status >= 500
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error: unknown, _query) => {
            // @todo add notifications/toasts for network errors e.g. toast.error(error.message)

            if (error instanceof AuthError) {
              console.error(`global query error handler (AuthError) [${error.message}]`, error)

              queryClient.removeQueries(authQueryKeys.session)
              queryClient.clear()

              if (router.asPath !== SIGN_IN_ROUTE) {
                routerPush(SIGN_IN_ROUTE)
              }

              return
            }

            // // only show toast if there's already data in the cache - this indicates a failed background update
            // if (query.state.data !== undefined) {
            //   // toast.error(`Something went wrong: ${error.message}`)
            // }
            console.error('global query error handler:', error instanceof Error ? error.message : String(error))
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: unknown) => console.error('global mutation error handler:', error),
        }),
      }),
  )

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content={process.env.NEXT_PUBLIC_SITE_META_DESCRIPTION} key="description" />
        <title>{process.env.NEXT_PUBLIC_SITE_TITLE}</title>
      </Head>
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ resetErrorBoundary }) => (
          <div>
            <span>{LABELS.ERROR_BOUNDARY_MESSAGE}</span>
            <ActionButton onClick={() => resetErrorBoundary()}>{LABELS.ERROR_BOUNDARY_TRY_AGAIN_ACTION}</ActionButton>
          </div>
        )}
      >
        <QueryClientProvider client={queryClient}>
          <SessionContextProvider>
            {(isSessionReady) => (
              <>
                {isPublicRoute(router.asPath) ? (
                  <AppLayout navigationLinks={isSessionReady ? AUTHENTICATED_NAV_LINKS : PUBLIC_NAV_LINKS}>
                    <PublicLayout>
                      <Component {...pageProps} />
                    </PublicLayout>
                  </AppLayout>
                ) : isSessionReady ? (
                  <AppLayout navigationLinks={isSessionReady ? AUTHENTICATED_NAV_LINKS : PUBLIC_NAV_LINKS}>
                    <AuthenticatedLayout>
                      {/* autherrorlistener, sessiontimer, etc */}
                      <Component {...pageProps} />
                    </AuthenticatedLayout>
                  </AppLayout>
                ) : (
                  <PlaceholderLayout>
                    <SessionLoadingScreen />
                  </PlaceholderLayout>
                )}
              </>
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
