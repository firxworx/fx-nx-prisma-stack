import { useState } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
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
import { ApiError } from '../api/errors/ApiError.class'
import { ModalContextProvider } from '../context/ModalContextProvider'
import { SessionContextProvider } from '../context/SessionContextProvider'
import { AppLayout } from '../components/layout/AppLayout'
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout'
import { PlaceholderLayout } from '../components/layout/PlaceholderLayout'
import { PublicLayout } from '../components/layout/PublicLayout'
import { SessionLoadingScreen } from '../components/layout/SessionLoadingScreen'
import { ActionButton } from '../components/elements/inputs/ActionButton'

import { LOCAL_STORAGE_SESSION_CTX_FLAG_KEY } from '../api/constants/auth'
import { authQueryKeys } from '../api/hooks/auth'
import { AppConfig, ApplicationContextProvider, useApplicationContext } from '../context/ApplicationContextProvider'

export const SIGN_IN_ROUTE = '/sign-in'
export const DEFAULT_AUTHENTICATED_ROUTE = '/app'

export const PUBLIC_ROUTES_WHITELIST = ['/', SIGN_IN_ROUTE, '/about']

export const PUBLIC_NAV_LINKS = [{ title: 'About', href: '/about' }]

export const AUTHENTICATED_NAV_LINKS = [
  { title: 'App', href: DEFAULT_AUTHENTICATED_ROUTE },
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

/**
 * Project parent with top-level context providers including global configuration of react-query.
 */
const ReactApp: React.FC<AppProps> = ({ Component, pageProps, router }) => {
  const app = useApplicationContext()

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            suspense: false,
            retry: (failCount, error): boolean => {
              if (error instanceof ApiError && error.status === 404) {
                return false
              }

              console.warn(`queryclient queries error count: ${failCount}`)
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

              // refer to SessionContextProvider + useAuthSessionQuery() for complete auth behavior
              if (typeof window !== 'undefined') {
                console.warn('setting localstorage to disable session query...')
                window.localStorage.setItem(LOCAL_STORAGE_SESSION_CTX_FLAG_KEY, 'disabled')
              }

              if (!isPublicRoute(router.asPath) && router.pathname !== SIGN_IN_ROUTE) {
                router.push(
                  router.asPath
                    ? `${app.keyRoutes.signIn}?redirect=${encodeURIComponent(router.asPath)}`
                    : app.keyRoutes.signIn,
                )
              }

              queryClient.removeQueries(authQueryKeys.all) // added - clear cache results (new requests will hard-load)
              queryClient.clear() // dev note: omit may cause uncaught exception fail at line 108 fail of apiFetch
              return
            }

            // // only show toast if there's already data in the cache as this indicates a failed background update
            // if (query.state.data !== undefined) {
            //   // toast.error(`Something went wrong: ${error.message}`)
            // }

            // dev-only debug @todo grep pass for console log/warn/error and remove for production
            console.error('global query error handler:', error instanceof Error ? error.message : String(error))
          },
        }),
        mutationCache: new MutationCache({
          // dev-only debug
          onError: (error: unknown) => console.error('global mutation error handler:', error),
        }),
      }),
  )

  return (
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
  )
}

/**
 * Custom NextJS App.
 */
function CustomApp({ Component, pageProps, router }: AppProps): JSX.Element {
  const [appConfig] = useState<AppConfig>({
    keyRoutes: {
      signIn: SIGN_IN_ROUTE,
    },
  })

  const { reset } = useQueryErrorResetBoundary()

  return (
    <ApplicationContextProvider config={appConfig}>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta key="description" name="description" content={process.env.NEXT_PUBLIC_SITE_META_DESCRIPTION} />
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
        <ReactApp Component={Component} pageProps={pageProps} router={router} />
      </ErrorBoundary>
    </ApplicationContextProvider>
  )
}

export default CustomApp
