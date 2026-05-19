import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCats } from '../hooks/useCats'
import { useTasks } from '../hooks/useTasks'
import { useVetRecords } from '../hooks/useVetRecords'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import CatForm from '../components/CatForm'
import ConfirmDialog from '../components/ConfirmDialog'
import api from '../services/api'
import { getCatAvatar } from '../utils/catImages'

const TABS = ['Basic Info', 'Health', 'Notes']

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  const days  = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30)  return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  const years = Math.floor(months / 12)
  return `${years} year${years > 1 ? 's' : ''} ago`
}

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function humanAge(catYears) {
  const y = parseFloat(catYears)
  if (isNaN(y)) return null
  if (y <= 1)  return Math.round(y * 15)
  if (y <= 2)  return Math.round(15 + (y - 1) * 9)
  return Math.round(24 + (y - 2) * 4)
}

function lifeStage(catYears) {
  const y = parseFloat(catYears)
  if (isNaN(y)) return null
  if (y < 1)   return { label: 'Kitten',   color: '#f59e0b', tip: 'Needs frequent feeding, vaccinations, and socialisation.' }
  if (y < 3)   return { label: 'Junior',   color: '#10b981', tip: 'High energy — needs plenty of play and mental stimulation.' }
  if (y < 7)   return { label: 'Adult',    color: '#6366f1', tip: 'Annual vet checkups and consistent routine are key.' }
  if (y < 11)  return { label: 'Mature',   color: '#8b5cf6', tip: 'Watch for weight changes and dental health.' }
  if (y < 15)  return { label: 'Senior',   color: '#f97316', tip: 'Bi-annual vet visits recommended. Joint and kidney health matter.' }
  return         { label: 'Geriatric', color: '#ef4444', tip: 'Needs extra warmth, soft food, and frequent vet monitoring.' }
}

// ── Activity Summary ──────────────────────────────────────────────────────────
function ActivitySummary({ catId, color }) {
  const today = new Date().toISOString().split('T')[0]
  const { tasks,   loading: tLoading } = useTasks(catId, today)
  const { records, loading: vLoading } = useVetRecords(catId)

  const todayTotal     = tasks.length
  const todayDone      = tasks.filter(t => t.completed).length
  const todayPct       = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : null

  // Sort records by date descending
  const sorted         = [...records].sort((a, b) => new Date(b.date) - new Date(a.date))
  const lastVisit      = sorted[0]
  const nextVisitRec   = records
    .filter(r => r.nextVisitDate && new Date(r.nextVisitDate) > new Date())
    .sort((a, b) => new Date(a.nextVisitDate) - new Date(b.nextVisitDate))[0]

  const stats = [
    {
      icon: '✅',
      label: 'Tasks Today',
      value: tLoading ? '…' : todayTotal === 0 ? 'None set' : `${todayDone}/${todayTotal} done`,
      sub: todayPct !== null ? `${todayPct}% complete` : null,
      progress: todayPct,
    },
    {
      icon: '🏥',
      label: 'Last Vet Visit',
      value: vLoading ? '…' : lastVisit ? timeAgo(lastVisit.date) : 'No records yet',
      sub: lastVisit ? `${lastVisit.type} · ${lastVisit.vetName || lastVisit.clinic || ''}`.replace(/ · $/, '') : null,
    },
    {
      icon: '📅',
      label: 'Next Visit Due',
      value: vLoading ? '…' : nextVisitRec ? formatDate(nextVisitRec.nextVisitDate) : 'Not scheduled',
      sub: nextVisitRec ? nextVisitRec.type : null,
      urgent: nextVisitRec && new Date(nextVisitRec.nextVisitDate) < new Date(Date.now() + 7 * 86400000),
    },
    {
      icon: '📋',
      label: 'Total Records',
      value: vLoading ? '…' : `${records.length} visit${records.length !== 1 ? 's' : ''}`,
      sub: records.length > 0 ? `Since ${formatDate(sorted[sorted.length - 1]?.date)}` : null,
    },
  ]

  return (
    <div className="card p-5">
      <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
        Activity Summary
      </p>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon, label, value, sub, progress, urgent }) => (
          <div key={label} className="rounded-2xl p-3.5"
            style={{ background: 'var(--bg-base)', border: `1px solid ${urgent ? '#fca5a5' : 'var(--border)'}` }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{icon}</span>
              <p className="text-xs font-black uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
            <p className="text-sm font-bold" style={{ color: urgent ? '#ef4444' : 'var(--text-primary)' }}>{value}</p>
            {sub && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
            {progress !== null && progress !== undefined && (
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: progress === 100 ? '#10b981' : color }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Emergency Card ────────────────────────────────────────────────────────────
function EmergencyCard({ cat, user, color, onClose }) {
  const printRef = useRef(null)
  const { records } = useVetRecords(cat._id)

  const lastVet = [...records]
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]

  const handlePrint = () => {
    const content = printRef.current
    const win = window.open('', '_blank', 'width=800,height=600')
    win.document.write(`
      <html>
        <head>
          <title>Emergency Card — ${cat.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 32px; color: #1e293b; background: white; }
            .card { border: 2px solid ${color}; border-radius: 16px; overflow: hidden; max-width: 600px; margin: 0 auto; }
            .header { background: ${color}; color: white; padding: 20px 24px; display: flex; align-items: center; gap: 16px; }
            .avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,255,255,0.5); }
            .header h1 { font-size: 24px; font-weight: 800; }
            .header p { font-size: 13px; opacity: 0.85; margin-top: 2px; }
            .body { padding: 20px 24px; }
            .section { margin-bottom: 16px; }
            .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 8px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .field { background: #f8fafc; border-radius: 8px; padding: 10px 12px; }
            .field-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
            .field-value { font-size: 13px; font-weight: 600; color: #1e293b; margin-top: 2px; }
            .alert { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 10px 12px; }
            .alert .field-label { color: #ef4444; }
            .alert .field-value { color: #dc2626; }
            .footer { background: #f8fafc; padding: 12px 24px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${content.innerHTML}
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `)
    win.document.close()
  }

  const avatarUrl = cat.image || getCatAvatar(cat._id)
  const stage     = lifeStage(cat.age)
  const human     = humanAge(cat.age)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-card)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>🆘 Emergency Card</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Print or screenshot to keep handy</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold text-white transition-all"
              style={{ background: color, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              🖨️ Print
            </button>
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all"
              style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}>
              ✕
            </button>
          </div>
        </div>

        {/* Card preview */}
        <div className="p-5">
          <div ref={printRef}>
            <div className="card" style={{ border: `2px solid ${color}`, borderRadius: '16px', overflow: 'hidden' }}>
              {/* Card header */}
              <div className="flex items-center gap-4 p-5" style={{ background: color }}>
                <img src={avatarUrl} alt={cat.name}
                  style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.5)', flexShrink: 0 }}
                  onError={e => { e.target.src = getCatAvatar(cat._id) }}
                />
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'white' }}>{cat.name}</h1>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginTop: '2px' }}>
                    {cat.breed || 'Mixed breed'} · {cat.age} yr{parseFloat(cat.age) !== 1 ? 's' : ''}
                    {human ? ` (≈${human} human yrs)` : ''}
                    {stage ? ` · ${stage.label}` : ''}
                  </p>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5 space-y-4" style={{ background: 'white', color: '#1e293b' }}>

                {/* Cat details */}
                <div>
                  <p className="section-title" style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', marginBottom: '8px' }}>
                    Cat Details
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { l: 'Age',    v: `${cat.age} years` },
                      { l: 'Breed',  v: cat.breed || 'Mixed breed' },
                      { l: 'Weight', v: cat.weight ? `${cat.weight} kg` : 'Not recorded' },
                      { l: 'Colour', v: cat.color ? 'See profile' : 'Not recorded' },
                    ].map(({ l, v }) => (
                      <div key={l} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 12px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{l}</p>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Health alerts */}
                {(cat.healthConditions || cat.allergies) && (
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#ef4444', marginBottom: '8px' }}>
                      ⚠️ Health Alerts
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: cat.healthConditions && cat.allergies ? '1fr 1fr' : '1fr', gap: '8px' }}>
                      {cat.healthConditions && (
                        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '10px 12px' }}>
                          <p style={{ fontSize: '10px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Conditions</p>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#92400e', marginTop: '2px' }}>{cat.healthConditions}</p>
                        </div>
                      )}
                      {cat.allergies && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 12px' }}>
                          <p style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>Allergies</p>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626', marginTop: '2px' }}>{cat.allergies}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Last vet info */}
                {lastVet && (
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', marginBottom: '8px' }}>
                      Last Vet Visit
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[
                        { l: 'Date',   v: new Date(lastVet.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                        { l: 'Type',   v: lastVet.type },
                        lastVet.vetName && { l: 'Vet',    v: lastVet.vetName },
                        lastVet.clinic  && { l: 'Clinic', v: lastVet.clinic  },
                      ].filter(Boolean).map(({ l, v }) => (
                        <div key={l} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px' }}>
                          <p style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>{l}</p>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#14532d', marginTop: '2px' }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Owner contact */}
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', marginBottom: '8px' }}>
                    Owner Contact
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 12px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Name</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{user?.name || '—'}</p>
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 12px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Email</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px', wordBreak: 'break-all' }}>{user?.email || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Generated by Purrfect Care · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CatProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cats, updateCat, deleteCat, toggleShare } = useCats()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [cat, setCat]             = useState(null)
  const [tab, setTab]             = useState('Basic Info')
  const [editing, setEditing]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [showDel, setShowDel]       = useState(false)
  const [deleting, setDel]          = useState(false)
  const [showEmCard, setShowEmCard] = useState(false)
  const [sharing, setSharing]       = useState(false)

  useEffect(() => {
    const found = cats.find(c => c._id === id)
    if (found) { setCat(found); return }
    api.get(`/cats/${id}`).then(r => setCat(r.data)).catch(() => navigate('/cats'))
  }, [id, cats])

  if (!cat) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const avatarUrl = cat.image || getCatAvatar(cat._id)
  const color     = cat.color || '#4f46e5'
  const stage     = lifeStage(cat.age)
  const human     = humanAge(cat.age)

  const handleUpdate = async (data) => {
    try {
      setSaving(true)
      const updated = await updateCat(id, data)
      setCat(updated)
      setEditing(false)
      addToast(`${updated.name}'s profile updated! 🐾`, 'success')
    } catch { addToast('Failed to update. Please try again.', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      setDel(true)
      await deleteCat(id)
      addToast(`${cat.name}'s profile removed 😿`, 'info')
      navigate('/cats')
    } catch { addToast('Failed to delete.', 'error') }
    finally { setDel(false) }
  }

  const handleShare = async () => {
    try {
      setSharing(true)
      const result = await toggleShare(id)
      setCat(prev => ({ ...prev, ...result }))
      if (result.isShared) {
        const link = `${window.location.origin}/share/${result.shareToken}`
        await navigator.clipboard.writeText(link)
        addToast('Link copied to clipboard! 🔗', 'success')
      } else {
        addToast('Sharing disabled — link is now invalid', 'info')
      }
    } catch { addToast('Failed to update sharing', 'error') }
    finally { setSharing(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="space-y-5 pb-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/cats" className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 font-semibold transition-colors">My Cats</Link>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="text-slate-700 dark:text-slate-300 font-bold">{cat.name}</span>
      </div>

      {/* Hero photo card */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05, duration: 0.5 }} className="card overflow-hidden relative">
        <div className="h-56 relative overflow-hidden">
          <img src={avatarUrl} alt={cat.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={e => { e.target.src = getCatAvatar(cat._id) }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${color}ee 0%, transparent 60%)` }} />

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => setShowEmCard(true)}
              className="bg-white/20 hover:bg-white/40 backdrop-blur text-white font-bold text-sm px-3 py-2 rounded-xl border border-white/30 transition-all active:scale-95"
              title="Emergency Card">
              🆘
            </button>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="backdrop-blur text-white font-bold text-sm px-3 py-2 rounded-xl border transition-all active:scale-95 disabled:opacity-60"
              style={{
                background: cat.isShared ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.2)',
                borderColor: cat.isShared ? 'rgba(16,185,129,0.8)' : 'rgba(255,255,255,0.3)',
              }}
              title={cat.isShared ? 'Sharing on — click to disable' : 'Share profile'}>
              {sharing ? '⏳' : cat.isShared ? '🔗 Shared' : '🔗 Share'}
            </button>
            <button onClick={() => setEditing(!editing)}
              className="bg-white/20 hover:bg-white/40 backdrop-blur text-white font-bold text-sm px-4 py-2 rounded-xl border border-white/30 transition-all active:scale-95">
              {editing ? '✕ Cancel' : '✏️ Edit'}
            </button>
            <button onClick={() => setShowDel(true)}
              className="bg-red-500/80 hover:bg-red-600 text-white font-bold text-sm px-3 py-2 rounded-xl transition-all active:scale-95">
              🗑
            </button>
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="font-display text-4xl text-white drop-shadow-lg">{cat.name}</h1>
            <p className="text-white/80 text-sm font-medium mt-1">
              {cat.breed || 'Mixed breed'} · {cat.age} yr{parseFloat(cat.age) !== 1 ? 's' : ''}
              {human ? ` · ≈${human} human yrs` : ''}
              {cat.weight ? ` · ${cat.weight}kg` : ''}
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
          {stage && (
            <span className="badge font-bold" style={{ background: `${stage.color}20`, color: stage.color }}>
              🐱 {stage.label}
            </span>
          )}
          {cat.healthConditions
            ? <span className="badge bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">⚠️ {cat.healthConditions}</span>
            : <span className="badge bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">💚 Healthy</span>
          }
          {cat.allergies && (
            <span className="badge bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">🚫 Allergic: {cat.allergies}</span>
          )}
          <div className="w-4 h-4 rounded-full ml-auto border-2 border-white dark:border-slate-800 shadow-sm"
            style={{ backgroundColor: color }} />
        </div>

        {/* Life stage tip */}
        {stage && (
          <div className="px-6 py-3 flex items-start gap-2"
            style={{ background: `${stage.color}10`, borderTop: `1px solid ${stage.color}30` }}>
            <span className="text-sm">💡</span>
            <p className="text-xs font-medium" style={{ color: stage.color }}>{stage.tip}</p>
          </div>
        )}

        {/* Share status banner */}
        {cat.isShared && cat.shareToken && (
          <div className="px-5 py-3 flex items-center gap-3 flex-wrap"
            style={{ background: 'rgba(16,185,129,0.08)', borderTop: '1px solid rgba(16,185,129,0.2)' }}>
            <span className="text-sm">🔗</span>
            <p className="text-xs font-semibold flex-1 truncate" style={{ color: '#10b981' }}>
              {`${window.location.origin}/share/${cat.shareToken}`}
            </p>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(`${window.location.origin}/share/${cat.shareToken}`)
                addToast('Link copied! 🔗', 'success')
              }}
              className="text-xs font-bold px-3 py-1 rounded-lg flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
              Copy
            </button>
          </div>
        )}
      </motion.div>

      {/* Edit form */}
      <AnimatePresence>
        {editing && (
          <motion.div key="edit-form"
            initial={{ opacity: 0, y: -12, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -12, height: 0 }} transition={{ duration: 0.3 }}
            className="card p-6 dark:bg-slate-900">
            <h2 className="section-title mb-5">Edit Profile</h2>
            <CatForm initial={cat} onSubmit={handleUpdate} onCancel={() => setEditing(false)} loading={saving} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Summary */}
      {!editing && <ActivitySummary catId={id} color={color} />}

      {/* Tabs + content */}
      {!editing && (
        <>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 relative
                  ${tab === t ? 'bg-white dark:bg-slate-700 shadow-soft' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                style={tab === t ? { color } : {}}>
                {t}
                {tab === t && (
                  <motion.div layoutId="tab-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                    style={{ background: color }} />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
              className="card p-6 dark:bg-slate-900">
              {tab === 'Basic Info' && (
                <dl className="divide-y divide-slate-50 dark:divide-slate-800">
                  {[
                    { l: 'Name',        v: cat.name },
                    { l: 'Age',         v: `${cat.age} years${human ? ` (≈ ${human} human years)` : ''}` },
                    { l: 'Life Stage',  v: stage?.label || '—' },
                    { l: 'Breed',       v: cat.breed || '—' },
                    { l: 'Weight',      v: cat.weight ? `${cat.weight} kg` : '—' },
                  ].map(({ l, v }) => (
                    <div key={l} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                      <dt className="text-xs font-black uppercase tracking-widest text-slate-400">{l}</dt>
                      <dd className="text-sm font-bold text-slate-700 dark:text-slate-300">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {tab === 'Health' && (
                <div className="space-y-5">
                  <div>
                    <p className="label">Health Conditions</p>
                    {cat.healthConditions
                      ? <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-3 font-medium mt-2">{cat.healthConditions}</p>
                      : <p className="text-sm text-slate-400 italic mt-2">No health conditions recorded</p>
                    }
                  </div>
                  <div>
                    <p className="label">Allergies</p>
                    {cat.allergies
                      ? <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 font-medium mt-2">{cat.allergies}</p>
                      : <p className="text-sm text-slate-400 italic mt-2">No known allergies</p>
                    }
                  </div>
                </div>
              )}

              {tab === 'Notes' && (
                <div>
                  <p className="label">Personal Notes</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap mt-2">
                    {cat.notes || <span className="italic text-slate-400">No notes yet. Edit this profile to add some thoughts about {cat.name}!</span>}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {/* Quick links */}
      {!editing && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { to: `/checklist?cat=${id}`, icon: '✅', label: 'Tasks',       desc: 'Daily care' },
            { to: `/vet?cat=${id}`,       icon: '🏥', label: 'Vet Records', desc: 'Health history' },
            { to: `/products`,            icon: '🛍️', label: 'Shop',        desc: 'Product picks' },
          ].map(({ to, icon, label, desc }, i) => (
            <motion.div key={to} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}>
              <Link to={to} className="card card-hover p-4 text-center block">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center text-xl mx-auto mb-2 shadow-soft">{icon}</div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Emergency card modal */}
      <AnimatePresence>
        {showEmCard && (
          <EmergencyCard cat={cat} user={user} color={color} onClose={() => setShowEmCard(false)} />
        )}
      </AnimatePresence>

      <ConfirmDialog isOpen={showDel} onClose={() => setShowDel(false)} onConfirm={handleDelete}
        title={`Remove ${cat.name}?`}
        message={`This will permanently delete ${cat.name}'s profile, tasks, and vet records. This action cannot be undone.`}
        loading={deleting} />
    </motion.div>
  )
}
