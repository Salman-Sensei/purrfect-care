import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCats } from '../hooks/useCats'
import { useToast } from '../context/ToastContext'
import CatForm from '../components/CatForm'
import ConfirmDialog from '../components/ConfirmDialog'
import api from '../services/api'
import { getCatAvatar } from '../utils/catImages'

const TABS = ['Basic Info', 'Health', 'Notes']

export default function CatProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cats, updateCat, deleteCat } = useCats()
  const { addToast } = useToast()

  const [cat, setCat]         = useState(null)
  const [tab, setTab]         = useState('Basic Info')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [showDel, setShowDel] = useState(false)
  const [deleting, setDel]    = useState(false)

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

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
      className="space-y-5 pb-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/cats" className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 font-semibold transition-colors">My Cats</Link>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="text-slate-700 dark:text-slate-300 font-bold">{cat.name}</span>
      </div>

      {/* Hero photo card */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05, duration: 0.5 }}
        className="card overflow-hidden relative">
        <div className="h-56 relative overflow-hidden">
          <img src={avatarUrl} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={e => { e.target.src = getCatAvatar(cat._id) }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${color}ee 0%, transparent 60%)` }} />

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
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
              {cat.breed || 'Mixed breed'} · {cat.age}{cat.weight ? ` · ${cat.weight}kg` : ''}
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
          {cat.healthConditions
            ? <span className="badge bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">⚠️ {cat.healthConditions}</span>
            : <span className="badge bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">💚 Healthy</span>
          }
          {cat.allergies && <span className="badge bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">🚫 Allergic to: {cat.allergies}</span>}
          <div className="w-4 h-4 rounded-full ml-auto border-2 border-white dark:border-slate-800 shadow-sm" style={{ backgroundColor: color }} />
        </div>
      </motion.div>

      {/* Edit form */}
      <AnimatePresence>
        {editing && (
          <motion.div key="edit-form" initial={{ opacity: 0, y: -12, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -12, height: 0 }} transition={{ duration: 0.3 }}
            className="card p-6 dark:bg-slate-900">
            <h2 className="section-title mb-5">Edit Profile</h2>
            <CatForm initial={cat} onSubmit={handleUpdate} onCancel={() => setEditing(false)} loading={saving} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs + content */}
      {!editing && (
        <>
          {/* Tab bar */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 relative
                  ${tab === t ? 'bg-white dark:bg-slate-700 shadow-soft' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                style={tab === t ? { color } : {}}>
                {t}
                {tab === t && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                    style={{ background: color }} />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
              className="card p-6 dark:bg-slate-900">
              {tab === 'Basic Info' && (
                <dl className="divide-y divide-slate-50 dark:divide-slate-800">
                  {[
                    { l: 'Name',   v: cat.name },
                    { l: 'Age',    v: cat.age },
                    { l: 'Breed',  v: cat.breed || '—' },
                    { l: 'Weight', v: cat.weight ? `${cat.weight} kg` : '—' },
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
      <div className="grid grid-cols-2 gap-3">
        {[
          { to: `/checklist?cat=${id}`, icon: '✅', label: 'Tasks',       desc: `See ${cat.name}'s tasks` },
          { to: `/vet?cat=${id}`,       icon: '🏥', label: 'Vet Records', desc: 'View health history'      },
        ].map(({ to, icon, label, desc }, i) => (
          <motion.div key={to} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
            <Link to={to} className="card card-hover p-5 text-center block">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center text-2xl mx-auto mb-2 shadow-soft">{icon}</div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <ConfirmDialog isOpen={showDel} onClose={() => setShowDel(false)} onConfirm={handleDelete}
        title={`Remove ${cat.name}?`}
        message={`This will permanently delete ${cat.name}'s profile, tasks, and vet records. This action cannot be undone.`}
        loading={deleting} />
    </motion.div>
  )
}
