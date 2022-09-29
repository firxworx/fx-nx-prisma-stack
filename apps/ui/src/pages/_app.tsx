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

import { AuthError } from '../api/errors/AuthError.class'
import { SessionLoadingScreen } from '../components/layout/SessionLoadingScreen'
import { AppLayout } from '../components/layout/AppLayout'
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout'
import { PublicLayout } from '../components/layout/PublicLayout'
import { SessionContextProvider } from '../context/SessionContextProvider'
import { ActionButton } from '../components/elements/inputs/ActionButton'
import { PlaceholderLayout } from '../components/layout/PlaceholderLayout'
import { ModalContextProvider } from '../context/ModalContextProvider'
import { ApiError } from '../api/errors/ApiError.class'

export const SIGN_IN_ROUTE = '/sign-in'
export const DEFAULT_AUTHENTICATED_ROUTE = '/app'

export const PUBLIC_ROUTES_WHITELIST = ['/', SIGN_IN_ROUTE, '/about']

export const PUBLIC_NAV_LINKS = [
  { title: 'About', href: '/about' },
  { title: 'Sign-In', href: SIGN_IN_ROUTE },
]

export const AUTHENTICATED_NAV_LINKS = [
  { title: 'App', href: DEFAULT_AUTHENTICATED_ROUTE },
  { title: 'Videos', href: '/app/videos' },
  { title: 'Video Groups', href: '/app/video-groups' },
  { title: 'About', href: '/about' },
]

const LABELS = {
  ERROR_BOUNDARY_MESSAGE: 'There was an error',
  ERROR_BOUNDARY_TRY_AGAIN_ACTION: 'Try again',
}

const isPublicRoute = (routerPath: string): boolean =>
  routerPath === '/'
    ? true
    : PUBLIC_ROUTES_WHITELIST.concat(['/500', '/404']).some((route) =>
        route === '/' ? false : routerPath.startsWith(route),
      )

function CustomApp({ Component, pageProps, router }: AppProps): JSX.Element {
  const { push: routerPush } = useRouter()
  const { reset } = useQueryErrorResetBoundary()

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            suspense: false,
            retry: (_failCount, error): boolean => {
              if (error instanceof ApiError && error.status === 404) {
                return false
              }

              return true
            },
            // retry: true,
            // refetchOnWindowFocus: true,
            // useErrorBoundary: true,
            useErrorBoundary: (error: unknown): boolean => {
              return error instanceof AuthError // e.g. error.response?.status >= 500
            },
          },
          mutations: {
            // useErrorBoundary: false
            useErrorBoundary: (error: unknown): boolean => {
              return error instanceof AuthError // e.g. error.response?.status >= 500
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error: unknown, _query): void => {
            // @todo add notifications/toasts for network errors e.g. toast.error(error.message)

            if (error instanceof AuthError) {
              console.error(`Global query client error handler (AuthError Case) [${error.message}]`, error)

              if (router.pathname !== SIGN_IN_ROUTE) {
                routerPush(
                  router.asPath ? `${SIGN_IN_ROUTE}?redirect=${encodeURIComponent(router.asPath)}` : SIGN_IN_ROUTE,
                )
              }

              queryClient.clear()
              return
            }

            // // only show toast if there's already data in the cache -- indicates failed background update
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
        fallbackRender={({ resetErrorBoundary }): JSX.Element => (
          <div>
            <span>{LABELS.ERROR_BOUNDARY_MESSAGE}</span>
            <ActionButton onClick={(): void => resetErrorBoundary()}>
              {LABELS.ERROR_BOUNDARY_TRY_AGAIN_ACTION}
            </ActionButton>
          </div>
        )}
      >
        <QueryClientProvider client={queryClient}>
          <ModalContextProvider>
            <SessionContextProvider>
              {(isSessionReady): JSX.Element => (
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
          </ModalContextProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </>
  )
}

export default CustomApp
