import React, { useContext, useMemo, useState } from 'react'

export interface AppConfig {
  keyRoutes: {
    signIn: string
  }
}

export interface ApplicationContext {
  set: (config: AppConfig) => void
  config: AppConfig | undefined
}

const ApplicationContext = React.createContext<ApplicationContext | undefined>(undefined)

export const ApplicationContextProvider: React.FC<React.PropsWithChildren<Pick<ApplicationContext, 'config'>>> = ({
  config,
  children,
}) => {
  const [appConfig, setAppConfig] = useState<AppConfig | undefined>(config)

  const contextValue: ApplicationContext = useMemo(() => {
    return {
      set: setAppConfig,
      config: appConfig,
    }
  }, [appConfig])

  return <ApplicationContext.Provider value={contextValue}>{children}</ApplicationContext.Provider>
}

/**
 * Provide static UI configuration details that universally apply throughout the app.
 */
export function useApplicationContext(): AppConfig {
  const context = useContext(ApplicationContext)

  if (context === undefined) {
    throw new Error('useApplicationContext must be used within an ApplicationContextProvider')
  }

  if (!context?.config) {
    throw new Error('Application context not available')
  }

  return context.config
}
