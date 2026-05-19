import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import { getCatAvatar } from '../utils/catImages'

function humanAge(catYears) {
  const y = parseFloat(catYears)
  if (isNaN(y)) return null
  if (y <= 1) return Math.round(y * 15)
  if (y <= 2) return Math.round(15 + (y - 1) * 9)
  return Math.round(24 + (y - 2) * 4)
}

function lifeStage(catYears) {
  const y = parseFloat(catYears)
  if (isNaN(y)) return null
  if (y < 1)  return { label: 'Kitten',   color: '#f59e0b' }
  if (y < 3)  return { label: 'Junior',   color: '#10b981' }
  if (y < 7)  return { label: 'Adult',    color: '#6366f1' }
  if (y < 11) return { label: 'Mature',   color: '#8b5cf6' }
  if (y < 15) return { label: 'Senior',   color: '#f97316' }
  return       { label: 'Geriatric', color: '#ef4444' }
}

export default function SharedCatPage() {
  const { token } = useParams()
  const [cat, setCat]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    api.get(`/cats/shared/${token}`)
      .then(r => setCat(r.data))
      .catch(() => setError('This profile is not available. The link may have expired or sharing was disabled.'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--accent-1)', borderTopColor: 'transparent' }} />
        <p className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-5xl">🐱</p>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile Unavailable</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
        <Link to="/" className="inline-block mt-4 px-6 py-2.5 rounded-2xl text-sm font-bold text-white"
          style={{ background: 'var(--accent-1)' }}>
          Go to Purrfect Care
        </Link>
      </div>
    </div>
  )

  const color    = cat.color || '#6366f1'
  const avatar   = cat.image || getCatAvatar(cat._id)
  const human    = humanAge(cat.age)
  const stage    = lifeStage(cat.age)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-black"
            style={{ background: 'var(--accent-1)' }}>🐾</div>
          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Purrfect Care</span>
        </div>
        <Link to="/signup"
          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
          style={{ background: 'var(--accent-1)', boxShadow: '0 2px 8px var(--accent-glow)' }}>
          Create Account
        </Link>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-5">

        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="card overflow-hidden">
          <div className="h-52 relative overflow-hidden">
            <img src={avatar} alt={cat.name}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = getCatAvatar(cat._id) }} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${color}ee 0%, transparent 55%)` }} />
            <div className="absolute bottom-0 left-0 p-5">
              <h1 className="font-display text-4xl text-white drop-shadow-lg">{cat.name}</h1>
              <p className="text-white/80 text-sm mt-1">
                {cat.breed || 'Mixed breed'} · {cat.age} yr{parseFloat(cat.age) !== 1 ? 's' : ''}
                {human ? ` · ≈${human} human yrs` : ''}
                {cat.weight ? ` · ${cat.weight}kg` : ''}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="px-5 py-4 flex items-center gap-2 flex-wrap border-b" style={{ borderColor: 'var(--border)' }}>
            {stage && (
              <span className="badge font-bold text-xs px-3 py-1 rounded-full"
                style={{ background: `${stage.color}20`, color: stage.color }}>
                🐱 {stage.label}
              </span>
            )}
            {cat.healthConditions
              ? <span className="badge bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs">⚠️ {cat.healthConditions}</span>
              : <span className="badge bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs">💚 Healthy</span>
            }
            {cat.allergies && (
              <span className="badge bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs">🚫 Allergic: {cat.allergies}</span>
            )}
          </div>
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }} className="card p-5">
          <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            Profile Details
          </p>
          <dl className="divide-y divide-slate-50 dark:divide-slate-800">
            {[
              { l: 'Name',       v: cat.name },
              { l: 'Age',        v: `${cat.age} years${human ? ` (≈ ${human} human years)` : ''}` },
              { l: 'Life Stage', v: stage?.label || '—' },
              { l: 'Breed',      v: cat.breed || '—' },
              { l: 'Weight',     v: cat.weight ? `${cat.weight} kg` : '—' },
            ].map(({ l, v }) => (
              <div key={l} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                <dt className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{l}</dt>
                <dd className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{v}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        {/* Health */}
        {(cat.healthConditions || cat.allergies) && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }} className="card p-5 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Health Info
            </p>
            {cat.healthConditions && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Conditions</p>
                <p className="text-sm font-medium px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                  {cat.healthConditions}
                </p>
              </div>
            )}
            {cat.allergies && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Allergies</p>
                <p className="text-sm font-medium px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  {cat.allergies}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Notes */}
        {cat.notes && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }} className="card p-5">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Notes</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
              {cat.notes}
            </p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="card p-5 text-center space-y-3">
          <p className="text-2xl">🐾</p>
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            Track your own cat's care with Purrfect Care
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Daily tasks, vet records, health tracking and more — free forever.
          </p>
          <Link to="/signup"
            className="inline-block px-6 py-2.5 rounded-2xl text-sm font-bold text-white mt-1"
            style={{ background: 'var(--accent-1)', boxShadow: '0 4px 12px var(--accent-glow)' }}>
            Get Started Free
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
