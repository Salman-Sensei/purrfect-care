import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTasks } from '../hooks/useTasks'
import { useCats } from '../hooks/useCats'
import { useToast } from '../context/ToastContext'
import TaskCard from '../components/TaskCard'
import TaskForm from '../components/TaskForm'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { SkeletonList } from '../components/SkeletonCard'
import { CAT_CHECKLIST } from '../utils/catImages'

export default function ChecklistPage() {
  const [searchParams]       = useSearchParams()
  const [selectedCat, setSC] = useState(searchParams.get('cat') || '')
  const [selectedDate, setSD]= useState(new Date().toISOString().split('T')[0])
  const [filter, setFilter]  = useState('all')
  const [showAdd, setShowAdd]= useState(false)
  const [adding, setAdding]  = useState(false)

  const { cats }                                                          = useCats()
  const { tasks, loading, toggleTask, createTask, deleteTask, completedCount } = useTasks(selectedCat || null, selectedDate)
  const { addToast }                                                      = useToast()

  const filtered = tasks.filter(t =>
    filter === 'pending' ? !t.completed : filter === 'done' ? t.completed : true
  )
  const pct = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0

  const handleToggle = async (id) => {
    try {
      const updated = await toggleTask(id)
      if (updated.completed) addToast(`🐾 "${updated.title}" done! Great job!`, 'success')
    } catch { addToast('Could not update task. Check your connection.', 'error') }
  }

  const handleAdd = async (data) => {
    try {
      setAdding(true)
      await createTask({ ...data, date: selectedDate })
      setShowAdd(false)
      addToast('Task added! 📋', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add task', 'error')
    } finally { setAdding(false) }
  }

  const handleDelete = async (id) => {
    try { await deleteTask(id); addToast('Task removed', 'info') }
    catch { addToast('Failed to delete task', 'error') }
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
      className="space-y-5 pb-8">

      {/* Hero progress banner */}
      <div className="card overflow-hidden relative">
        <div className="absolute inset-0">
          <img src={CAT_CHECKLIST} alt="" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/85 via-brand-800/70 to-brand-600/50" />
        </div>
        <div className="relative z-10 p-6">
          <p className="text-brand-300 text-xs font-black uppercase tracking-widest mb-1">
            {isToday ? "Today's Schedule" : new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="font-display text-3xl text-white">Daily Tasks</h1>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur text-white font-bold text-sm px-4 py-2 rounded-2xl border border-white/30 transition-all">
              + Add Task
            </motion.button>
          </div>
          {tasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-white/80 text-sm">
                <span>{completedCount}/{tasks.length} tasks done</span>
                <span className="font-bold text-white">{pct}%</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-brand-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }}
                />
              </div>
              <AnimatePresence>
                {pct === 100 && (
                  <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-300 text-xs font-bold text-center pt-1">
                    🎉 All done! You're an amazing cat parent!
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <input type="date" className="input text-sm py-2 px-3 w-auto flex-shrink-0 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          value={selectedDate} onChange={e => setSD(e.target.value)} />

        {cats.length > 1 && (
          <select className="input text-sm py-2 px-3 w-auto flex-shrink-0 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            value={selectedCat} onChange={e => setSC(e.target.value)}>
            <option value="">All cats</option>
            {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        )}

        <div className="flex rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs font-bold ml-auto">
          {[['all','All'],['pending','Pending'],['done','Done ✓']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-2.5 transition-all ${filter === v
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {loading && <SkeletonList count={4} />}

      {!loading && filtered.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card">
          <EmptyState
            image={CAT_CHECKLIST}
            emoji={filter === 'done' ? '😸' : '☀️'}
            title={filter === 'done' ? 'No completed tasks yet' : 'No tasks for this day'}
            description={filter === 'done' ? "Complete some tasks and they'll appear here." : "Add tasks to keep your cat's day on track."}
            action={<button onClick={() => setShowAdd(true)} className="btn-primary text-sm">+ Add a Task</button>}
          />
        </motion.div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((task, i) => (
              <motion.div key={task._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35, ease: [0.22,1,0.36,1] }}>
                <TaskCard task={task} onToggle={handleToggle} onDelete={handleDelete} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && tasks.length > 0 && completedCount < tasks.length && (
        <p className="text-center text-xs text-slate-400 italic">
          {tasks.length - completedCount} task{tasks.length - completedCount > 1 ? 's' : ''} left. You've got this! 💪
        </p>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="📋 Add a Task">
        <TaskForm cats={cats} defaultCatId={selectedCat || cats[0]?._id || ''} onSubmit={handleAdd} onCancel={() => setShowAdd(false)} loading={adding} />
      </Modal>
    </motion.div>
  )
}
