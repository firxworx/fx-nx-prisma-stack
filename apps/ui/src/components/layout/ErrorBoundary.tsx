import React, { ErrorInfo } from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

/**
 * React Error Boundary to trap errors, display a fallback, and prevent crashes of the entire UI.
 * This component can be modified to report errors to an API, logs, and/or metrics service.
 *
 * {@link https://reactjs.org/docs/error-boundaries.html}
 */
export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = { hasError: false }

  static getDerivedStateFromError(_: Error): State {
    // update state so the next render shows the fallback UI
    return { hasError: true }
  }

  // @todo - add logging to error platform to ErrorBoundary e.g. logErrorToService(error, info)
  // @todo also refer to _app for error boundary lib added later + consolidate to one solution for error boundary
  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info)
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-4 my-8 rounded-md bg-white">
          <div className="flex justify-center">
            <h1 className="mb-4 text-lg font-bold text-red-800">Error</h1>
            <p className="text-gray-800">Error loading page</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
