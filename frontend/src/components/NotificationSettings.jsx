import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

export default function NotificationSettings() {
  const { addToast } = useToast()
  const [prefs, setPrefs]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [sending, setSending]   = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    api.get('/notifications/preferences')
      .then(r => setPrefs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async () => {
    try {
      setSaving(true)
      const { data } = await api.put('/notifications/preferences', {
        emailNotifications: !prefs.emailNotifications,
      })
      setPrefs(p => ({ ...p, emailNotifications: data.emailNotifications }))
      addToast(
        data.emailNotifications
          ? 'Daily email digest enabled 📧'
          : 'Email notifications disabled',
        data.emailNotifications ? 'success' : 'info'
      )
    } catch {
      addToast('Failed to update preferences', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSendTest = async () => {
    try {
      setSending(true)
      const { data } = await api.post('/notifications/send-test')
      addToast(data.message, data.skipped ? 'info' : 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send email', 'error')
    } finally {
      setSending(false)
    }
  }

  if (loading) return null

  return (
    <div className="card overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-5 text-left transition-all"
        style={{ background: 'var(--bg-card)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: 'var(--accent-soft)' }}>
            📧
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Email Notifications
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {prefs?.emailNotifications ? 'Daily digest enabled' : 'Notifications off'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle pill */}
          <div
            onClick={e => { e.stopPropagation(); handleToggle() }}
            className="relative w-11 h-6 rounded-full cursor-pointer transition-all duration-300 flex-shrink-0"
            style={{
              background: prefs?.emailNotifications ? 'var(--accent-1)' : 'var(--border)',
              opacity: saving ? 0.6 : 1,
            }}
          >
            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
              style={{ left: prefs?.emailNotifications ? '22px' : '2px' }} />
          </div>
          <span className="text-slate-400 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="pt-4 space-y-2">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  What you'll receive
                </p>
                <ul className="space-y-1.5">
                  {[
                    "📋 Today's pending tasks for all your cats",
                    "📅 Upcoming vet appointments in the next 30 days",
                    "⏰ Sent every morning at 8:00 AM",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="mt-0.5">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {prefs?.email && (
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sending to</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{prefs.email}</p>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSendTest}
                disabled={sending}
                className="w-full py-2.5 rounded-2xl text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--accent-1)',
                  border: '1px solid var(--accent-1)',
                }}
              >
                {sending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: 'var(--accent-1)', borderTopColor: 'transparent' }} />
                    Sending...
                  </>
                ) : (
                  '📤 Send Today\'s Summary Now'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
