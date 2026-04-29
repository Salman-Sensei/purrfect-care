import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useVetRecords } from '../hooks/useVetRecords'
import { useCats } from '../hooks/useCats'
import { useToast } from '../context/ToastContext'
import VetForm from '../components/VetForm'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import { SkeletonCard } from '../components/SkeletonCard'
import { CAT_VET } from '../utils/catImages'

const TYPE_META = {
  vaccination: { icon: '💉', bg: 'bg-blue-50 dark:bg-blue-900/20',     text: 'text-blue-700 dark:text-blue-400',     border: 'border-blue-200 dark:border-blue-800',     barColor: '#3b82f6', label: 'Vaccination' },
  checkup:     { icon: '🩺', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', barColor: '#10b981', label: 'Checkup'     },
  dental:      { icon: '🦷', bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-700 dark:text-amber-400',   border: 'border-amber-200 dark:border-amber-800',   barColor: '#f59e0b', label: 'Dental'      },
  emergency:   { icon: '🚨', bg: 'bg-red-50 dark:bg-red-900/20',       text: 'text-red-700 dark:text-red-400',       border: 'border-red-200 dark:border-red-800',       barColor: '#ef4444', label: 'Emergency'   },
  other:       { icon: '📋', bg: 'bg-slate-50 dark:bg-slate-800',      text: 'text-slate-600 dark:text-slate-400',   border: 'border-slate-200 dark:border-slate-700',   barColor: '#94a3b8', label: 'Other'       },
}

function VetRecordCard({ record, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const meta    = TYPE_META[record.type] || TYPE_META.other
  const date    = new Date(record.date)
  const hasNext = record.nextVisitDate && new Date(record.nextVisitDate) > new Date()

  return (
    <div className={`card card-hover border ${meta.border} overflow-hidden group`}>
      {/* Color top stripe */}
      <div className="h-1 w-full" style={{ background: meta.barColor }} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Type icon */}
          <div className={`w-12 h-12 rounded-2xl ${meta.bg} ${meta.border} border flex items-center justify-center text-2xl flex-shrink-0`}>
            {meta.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className={`badge ${meta.bg} ${meta.text} capitalize`}>{meta.label}</span>
                {record.catId?.name && (
                  <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    🐱 {record.catId.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-semibold flex-shrink-0">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {(record.vetName || record.clinic) && (
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1.5">
                👨‍⚕️ {[record.vetName, record.clinic].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>

        {record.notes && (
          <div className="mt-3">
            <p className={`text-sm text-slate-500 dark:text-slate-400 leading-relaxed ${!expanded && 'line-clamp-2'}`}>
              {record.notes}
            </p>
            {record.notes.length > 100 && (
              <button onClick={() => setExpanded(e => !e)}
                className="text-xs text-brand-600 dark:text-brand-400 font-bold mt-1 hover:underline">
                {expanded ? '↑ Show less' : '↓ Read more'}
              </button>
            )}
          </div>
        )}

        {hasNext && (
          <div className="mt-3 flex items-center gap-2 bg-coral-50 dark:bg-coral-900/20 border border-coral-200 dark:border-coral-900/40 rounded-xl px-3 py-2">
            <span className="text-base">📅</span>
            <p className="text-xs font-bold text-coral-700 dark:text-coral-400">
              Next visit: {new Date(record.nextVisitDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={() => onEdit(record)} className="btn-ghost text-xs py-1.5 px-3">✏️ Edit</button>
          <button onClick={() => onDelete(record._id)} className="btn-ghost text-xs py-1.5 px-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">🗑 Delete</button>
        </div>
      </div>
    </div>
  )
}

export default function VetRecordsPage() {
  const [searchParams]       = useSearchParams()
  const [selectedCat, setSC] = useState(searchParams.get('cat') || '')
  const [typeFilter, setTF]  = useState('')
  const [showAdd, setShowAdd]    = useState(false)
  const [editRecord, setEdit]    = useState(null)
  const [deleteId, setDeleteId]  = useState(null)
  const [saving, setSaving]      = useState(false)
  const [deleting, setDeleting]  = useState(false)

  const { cats }                                                         = useCats()
  const { records, loading, createRecord, updateRecord, deleteRecord }   = useVetRecords(selectedCat || null)
  const { addToast }                                                     = useToast()

  const filtered = typeFilter ? records.filter(r => r.type === typeFilter) : records

  const handleCreate = async (data) => {
    try { setSaving(true); await createRecord(data); setShowAdd(false); addToast('Vet record saved! 🏥', 'success') }
    catch (err) { addToast(err.response?.data?.message || 'Failed to save record', 'error') }
    finally { setSaving(false) }
  }

  const handleUpdate = async (data) => {
    try { setSaving(true); await updateRecord(editRecord._id, data); setEdit(null); addToast('Record updated! 📋', 'success') }
    catch { addToast('Failed to update record', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try { setDeleting(true); await deleteRecord(deleteId); setDeleteId(null); addToast('Record deleted', 'info') }
    catch { addToast('Failed to delete', 'error') }
    finally { setDeleting(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
      className="space-y-5 pb-8">

      {/* Hero banner */}
      <div className="card overflow-hidden relative">
        <div className="absolute inset-0">
          <img src={CAT_VET} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/75 to-transparent" />
        </div>
        <div className="relative z-10 p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Health History</p>
            <h1 className="font-display text-3xl text-white mb-1">Vet Records</h1>
            <p className="text-slate-300 text-sm">
              {records.length === 0 ? 'No records yet' : `${records.length} visit${records.length > 1 ? 's' : ''} recorded`}
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur text-white font-bold text-sm px-4 py-2.5 rounded-2xl border border-white/30 transition-all flex-shrink-0">
            + Add Record
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {cats.length > 1 && (
          <select className="input text-sm py-2 px-3 w-auto dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            value={selectedCat} onChange={e => setSC(e.target.value)}>
            <option value="">All Cats</option>
            {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        )}
        <select className="input text-sm py-2 px-3 w-auto dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          value={typeFilter} onChange={e => setTF(e.target.value)}>
          <option value="">All Types</option>
          {Object.entries(TYPE_META).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
        </select>

        {/* Type pills */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(TYPE_META).map(([v, { icon, label }]) => (
            <motion.button whileTap={{ scale: 0.93 }} key={v} onClick={() => setTF(typeFilter === v ? '' : v)}
              className={`text-xs px-3 py-1.5 rounded-full border font-bold transition-all
                ${typeFilter === v ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-brand-300'}`}>
              {icon} {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} lines={3} />)}</div>}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card">
          <EmptyState image={CAT_VET} emoji="🏥" title="No vet records yet"
            description="Keep your cat's health history organised — add vaccinations, checkups, and more."
            action={<button onClick={() => setShowAdd(true)} className="btn-primary">Add First Record</button>} />
        </motion.div>
      )}

      {/* Records */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((r, i) => (
              <motion.div key={r._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22,1,0.36,1] }}>
                <VetRecordCard record={r} onEdit={setEdit} onDelete={setDeleteId} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={showAdd}      onClose={() => setShowAdd(false)} title="🏥 New Vet Record">
        <VetForm cats={cats} onSubmit={handleCreate} onCancel={() => setShowAdd(false)} loading={saving} />
      </Modal>
      <Modal isOpen={!!editRecord} onClose={() => setEdit(null)} title="✏️ Edit Vet Record">
        {editRecord && <VetForm cats={cats} initial={editRecord} onSubmit={handleUpdate} onCancel={() => setEdit(null)} loading={saving} />}
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete this record?" message="This vet record will be permanently removed." loading={deleting} />
    </motion.div>
  )
}
