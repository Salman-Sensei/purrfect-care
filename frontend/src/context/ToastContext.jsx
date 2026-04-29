import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

const ICONS = { success: '🐾', error: '😿', info: 'ℹ️', warning: '⚠️' }
const STYLES = {
  success: 'bg-brand-600 text-white border-brand-500',
  error:   'bg-red-500 text-white border-red-400',
  info:    'bg-slate-800 text-white border-slate-700',
  warning: 'bg-amber-500 text-white border-amber-400',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, message, type, leaving: false }])
    setTimeout(() => {
      setToasts(p => p.map(t => t.id === id ? { ...t, leaving: true } : t))
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 350)
    }, 3200)
  }, [])

  const remove = useCallback((id) => {
    setToasts(p => p.map(t => t.id === id ? { ...t, leaving: true } : t))
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 350)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map(toast => (
          <div key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl shadow-luxury
              border text-sm font-semibold leading-snug
              transition-all duration-350
              ${toast.leaving ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100 animate-slide-down'}
              ${STYLES[toast.type]}
            `}>
            <span className="text-xl flex-shrink-0 mt-0.5">{ICONS[toast.type]}</span>
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => remove(toast.id)}
              className="opacity-70 hover:opacity-100 text-xl leading-none flex-shrink-0 ml-1 mt-0.5">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
