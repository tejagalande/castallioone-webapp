import { useState, useCallback } from 'react'
import type { ToastMessage, ToastType } from '../components/Toast'

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration: number = 4000) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: ToastMessage = { id, type, title, message, duration }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
      }

      return id
    },
    []
  )

  const showSuccess = useCallback((message: string, title?: string) => {
    return addToast(message, 'success', title || 'Success')
  }, [addToast])

  const showError = useCallback((message: string, title?: string) => {
    return addToast(message, 'error', title || 'Error')
  }, [addToast])

  const showWarning = useCallback((message: string, title?: string) => {
    return addToast(message, 'warning', title || 'Attention')
  }, [addToast])

  const showInfo = useCallback((message: string, title?: string) => {
    return addToast(message, 'info', title || 'Notice')
  }, [addToast])

  return {
    toasts,
    addToast,
    dismissToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
