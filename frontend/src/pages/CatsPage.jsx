// ─── CatsPage.jsx ─────────────────────────────────────────────────────────
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCats } from '../hooks/useCats'
import { useToast } from '../context/ToastContext'
import CatCard from '../components/CatCard'
import CatForm from '../components/CatForm'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import { SkeletonCard } from '../components/SkeletonCard'
import { CAT_EMPTY } from '../utils/catImages'

export default function CatsPage() {
  const { cats, loading, createCat, deleteCat } = useCats()
  const { addToast } = useToast()
  const [showAdd, setShowAdd]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleCreate = async (data) => {
    try {
      setSaving(true)
      const cat = await createCat(data)
      setShowAdd(false)
      addToast(`${cat.name} has joined the family! 🐱`, 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add cat. Please try again.', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    const cat = cats.find(c => c._id === deleteId)
    try {
      setDeleting(true)
      await deleteCat(deleteId)
      setDeleteId(null)
      addToast(`${cat?.name || 'Cat'} has been removed 😿`, 'info')
    } catch { addToast('Failed to delete. Please try again.', 'error') }
    finally { setDeleting(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
      className="space-y-6 pb-8">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-brand-500 mb-1">Your Family</p>
          <h1 className="page-title">My Cats</h1>
          <p className="text-sm text-slate-400 mt-1">
            {loading ? 'Loading...' : cats.length === 0 ? 'No cats yet' : `${cats.length} cat${cats.length > 1 ? 's' : ''} in your care`}
          </p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)} className="btn-primary text-sm">
          + Add Cat
        </motion.button>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[1,2,3,4].map(i => <SkeletonCard key={i} hasImage lines={2} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && cats.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="card">
          <EmptyState
            image={CAT_EMPTY} emoji="🐱"
            title="No cats in your family yet"
            description="Add your first furry family member to start tracking their daily care, health, and vet visits."
            action={<button onClick={() => setShowAdd(true)} className="btn-primary">Add Your First Cat 🐾</button>}
          />
        </motion.div>
      )}

      {/* Cat grid */}
      {!loading && cats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <AnimatePresence>
            {cats.map((cat, i) => (
              <motion.div key={cat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22,1,0.36,1] }}>
                <CatCard cat={cat} onDelete={(id) => setDeleteId(id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="🐱 Add a New Cat">
        <CatForm onSubmit={handleCreate} onCancel={() => setShowAdd(false)} loading={saving} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title={`Remove ${cats.find(c=>c._id===deleteId)?.name || 'this cat'}?`}
        message="This will permanently delete the cat profile and all associated tasks and vet records. This cannot be undone."
        loading={deleting}
      />
    </motion.div>
  )
}
