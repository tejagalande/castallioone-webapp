import type { ErrorInfo, ReactNode } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { recordException } from '../lib/firebaseCrashlytics'
import './AppErrorBoundary.css'

interface AppErrorBoundaryProps {
  children: ReactNode
}

const ErrorFallback = ({ resetErrorBoundary }: FallbackProps) => {
  const handleGoHome = () => {
    window.location.assign('/')
  }

  return (
    <main className="app-error-boundary" role="alert" aria-live="assertive">
      <section className="app-error-boundary__card" aria-labelledby="error-boundary-heading">
        <h1 id="error-boundary-heading" className="app-error-boundary__title">
          Something went wrong
        </h1>
        <p className="app-error-boundary__message">
          An unexpected error occurred. Our team has been notified. You can try again or return to
          the home page.
        </p>
        <div className="app-error-boundary__actions">
          <button
            type="button"
            className="app-error-boundary__btn app-error-boundary__btn--primary"
            onClick={resetErrorBoundary}
          >
            Try Again
          </button>
          <button
            type="button"
            className="app-error-boundary__btn app-error-boundary__btn--secondary"
            onClick={handleGoHome}
          >
            Go Home
          </button>
        </div>
      </section>
    </main>
  )
}

const handleBoundaryError = (error: unknown, info: ErrorInfo) => {
  void recordException(error, {
    fatal: true,
    source: 'react_error_boundary',
    componentStack: info.componentStack,
  })
}

export const AppErrorBoundary = ({ children }: AppErrorBoundaryProps) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleBoundaryError}>
      {children}
    </ErrorBoundary>
  )
}
