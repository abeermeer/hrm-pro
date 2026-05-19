"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { CheckCircle, XCircle, AlertCircle, X, Info } from "lucide-react"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (type: ToastType, title: string, message?: string) => void
  removeToast: (id: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => removeToast(id), 5000)
  }, [removeToast])

  const success = useCallback((title: string, message?: string) => addToast("success", title, message), [addToast])
  const error = useCallback((title: string, message?: string) => addToast("error", title, message), [addToast])
  const warning = useCallback((title: string, message?: string) => addToast("warning", title, message), [addToast])
  const info = useCallback((title: string, message?: string) => addToast("info", title, message), [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
  }

  const borders = {
    success: "border-green-200",
    error: "border-red-200",
    warning: "border-amber-200",
    info: "border-blue-200",
  }

  return (
    <div className={`flex items-start gap-3 p-4 bg-white rounded-lg shadow-lg border ${borders[toast.id as keyof typeof borders] || borders.info} animate-in slide-in-from-right`}>
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900">{toast.title}</div>
        {toast.message && <div className="text-xs text-gray-500 mt-0.5">{toast.message}</div>}
      </div>
      <button onClick={onClose} className="p-0.5 rounded hover:bg-gray-100 text-gray-400 flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}
