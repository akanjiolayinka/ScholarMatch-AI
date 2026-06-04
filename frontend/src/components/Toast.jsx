import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import './Toast.css'

const ToastCtx = createContext({ push: () => {} })

let nextId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((arr) => arr.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((messageOrOpts, type = 'info', duration = 3000) => {
    const opts = typeof messageOrOpts === 'string' ? { message: messageOrOpts, type, duration } : messageOrOpts
    const id = nextId++
    setToasts((arr) => [...arr, { id, type: 'info', duration: 3000, ...opts }])
    return id
  }, [])

  return (
    <ToastCtx.Provider value={{ push, dismiss }}>
      {children}
      <div className="toast-stack" role="region" aria-label="Notifications">
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />)}
      </div>
    </ToastCtx.Provider>
  )
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, toast.duration)
    return () => window.clearTimeout(id)
  }, [toast.duration, onDismiss])

  const iconForType = { success: 'ti-check', info: 'ti-info-circle', warning: 'ti-alert-triangle', error: 'ti-alert-circle' }
  return (
    <div className={`toast toast-${toast.type}`} role="status">
      <i className={`ti ${iconForType[toast.type] || 'ti-info-circle'}`} aria-hidden="true" />
      <span>{toast.message}</span>
      <button onClick={onDismiss} aria-label="Dismiss" className="toast-close">
        <i className="ti ti-x" aria-hidden="true" />
      </button>
    </div>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}
