'use client'

import { AlertCircle, X } from 'lucide-react'
import { useState } from 'react'

interface ErrorMessageProps {
  error: string
  details?: string
  onRetry?: () => void
  className?: string
}

export default function ErrorMessage({ 
  error, 
  details, 
  onRetry, 
  className = '' 
}: ErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className={`rounded-md bg-red-50 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{error}</h3>
          {details && (
            <div className="mt-2 text-sm text-red-700">
              <p>{details}</p>
            </div>
          )}
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                className="text-sm font-medium text-red-600 hover:text-red-500"
                onClick={onRetry}
              >
                Retry
              </button>
            </div>
          )}
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
              onClick={() => setIsVisible(false)}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}