'use client'

import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from 'react-error-boundary'
import { ErrorInfo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<FallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Card className="mx-auto max-w-md mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          Something went wrong
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          An error occurred while loading this component. Please try refreshing
          the page.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-xs">
            <summary className="cursor-pointer font-medium">
              Error details
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-red-600 overflow-auto">
              {error.toString()}
            </pre>
          </details>
        )}

        <Button
          onClick={resetErrorBoundary}
          className="w-full"
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  )
}

export function ErrorBoundary({
  children,
  fallback: FallbackComponent = DefaultErrorFallback,
  onError,
}: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Error boundary caught an error:', error, errorInfo)
    onError?.(error, errorInfo)
  }

  return (
    <ReactErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={handleError}
    >
      {children}
    </ReactErrorBoundary>
  )
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<FallbackProps>
) {
  function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`

  return WrappedComponent
}

// Custom hook for manually triggering errors in functional components
export function useErrorHandler() {
  const handleError = (error: Error) => {
    throw error
  }

  return handleError
}
