import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useCats } from '../hooks/useCats'
import { useTasks } from '../hooks/useTasks'
import { useVetRecords } from '../hooks/useVetRecords'
import TaskCard from '../components/TaskCard'
import { SkeletonList } from '../components/SkeletonCard'
import { getCatAvatar } from '../utils/catImages'
import NotificationSettings from '../components/NotificationSettings'

// ── Animated counter hook ──────────────────────────────────────────────────
function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (target === 0) { setVal(0); return }
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return val
}

// ── Confetti burst ─────────────────────────────────────────────────────────
function ConfettiBurst({ active }) {
  const colors = ['var(--accent-1)','var(--accent-2)','var(--coral)','var(--emerald)','var(--amber)']
  if (!active) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl z-20">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="absolute w-2 h-2 rounded-sm"
          style={{
            background: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: '-8px',
            animation: `confettiFall ${0.8 + Math.random() * 1}s ease-in ${Math.random() * 0.5}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
            opacity: 0.9,
          }} />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(400px) rotate(720deg) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ── Purr meter ─────────────────────────────────────────────────────────────
function PurrMeter({ completed, total }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
  const label =
    pct === 100 ? '🎉 Absolutely thriving!' :
    pct >= 60   ? '😸 Doing great today!'   :
    pct >= 30   ? '🐱 Getting there...'     :
                  "🌟 Let's get started!"
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Purr Level</span>
        <span className="text-sm font-black text-white">{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden bg-white/15">
        <motion.div
          className="h-full rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: 'linear-gradient(to right, var(--accent-1), var(--accent-2))', boxShadow: '0 0 12px var(--accent-glow)' }}
        >
          {pct > 5 && <div className="absolute right-0 top-0 bottom-0 w-3 rounded-full animate-pulse bg-white/40" />}
        </motion.div>
      </div>
      <p className="text-xs text-white/50">{label} · {completed}/{total} tasks</p>
    </div>
  )
}

// ── Animated stat card ──────────────────────────────────────────────────────
function StatCard({ icon, label, value, to, delay }) {
  const count = useCountUp(value, 900)
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: [0.22,1,0.36,1] }}>
      <Link to={to} className="t-card t-card-hover group p-5 block relative overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
          style={{ background: 'radial-gradient(circle at 50% 0%, var(--accent-soft), transparent 70%)' }} />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent-1)', boxShadow: '0 4px 12px var(--accent-glow)' }}>
              {icon}
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-4 h-4 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ color: 'var(--text-muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </div>
          <p className="font-display text-4xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{count}</p>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</p>
        </div>
      </Link>
    </motion.div>
  )
}

// ── Cat spotlight card ─────────────────────────────────────────────────────
function CatSpotlight({ cat }) {
  if (!cat) return null
  const avatar = cat.image || getCatAvatar(cat._id)
  const color  = cat.color || 'var(--accent-1)'
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: [0.22,1,0.36,1] }}
      className="t-card relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 70% 50%, ${color}20 0%, transparent 65%)` }} />
      <div className="relative flex flex-col md:flex-row items-stretch min-h-[180px]">
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--emerald)' }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Cat of the Day</span>
            </div>
            <h2 className="font-display text-4xl mb-1" style={{ color: 'var(--text-primary)' }}>{cat.name}</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {cat.breed || 'Mixed breed'} · {cat.age}{cat.weight ? ` · ${cat.weight}kg` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {cat.healthConditions
              ? <span className="t-badge text-xs" style={{ background: 'rgba(251,191,36,0.12)', color: 'var(--amber)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  ⚠️ {cat.healthConditions.split(',')[0]}
                </span>
              : <span className="t-badge text-xs" style={{ background: 'var(--emerald-soft)', color: 'var(--emerald)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  💚 Healthy
                </span>
            }
            {cat.allergies && (
              <span className="t-badge text-xs" style={{ background: 'var(--coral-soft)', color: 'var(--coral)', border: '1px solid rgba(249,112,102,0.2)' }}>
                🚫 Allergic: {cat.allergies.split(',')[0]}
              </span>
            )}
          </div>
          <Link to={`/cats/${cat._id}`} className="t-btn-secondary mt-5 self-start text-xs px-4 py-2">
            View Full Profile →
          </Link>
        </div>
        <div className="md:w-56 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
          <img src={avatar} alt={cat.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, var(--bg-card) 0%, transparent 40%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
        </div>
      </div>
    </motion.div>
  )
}

// ── Mini health timeline ───────────────────────────────────────────────────
function HealthTimeline({ records }) {
  if (!records || records.length === 0) return null
  const TYPE_COLOR = { vaccination: 'var(--accent-1)', checkup: 'var(--emerald)', dental: 'var(--amber)', emergency: 'var(--coral)', other: 'var(--text-muted)' }
  const TYPE_ICON  = { vaccination: '💉', checkup: '🩺', dental: '🦷', emergency: '🚨', other: '📋' }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
      className="t-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>Health Timeline</h3>
        <Link to="/vet" className="text-xs font-bold" style={{ color: 'var(--accent-1)' }}>All records →</Link>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />
        <div className="space-y-4 pl-10">
          {records.slice(0, 3).map((r, i) => (
            <motion.div key={r._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
              className="relative flex items-start gap-3 group">
              <div className="absolute -left-6 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-200"
                style={{ background: TYPE_COLOR[r.type] || TYPE_COLOR.other, borderColor: 'var(--bg-card)', boxShadow: `0 0 8px ${TYPE_COLOR[r.type]}60`, top: '2px' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{TYPE_ICON[r.type]}</span>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{r.catId?.name} — {r.type}</p>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {r.vetName ? ` · ${r.vetName}` : ''}
                </p>
                {r.notes && <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{r.notes}</p>}
              </div>
              <p className="text-[10px] font-black flex-shrink-0" style={{ color: TYPE_COLOR[r.type] || TYPE_COLOR.other }}>
                {r.type.toUpperCase()}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
const HERO_IMGS = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1400&q=90&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=1400&q=90&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=1400&q=90&auto=format&fit=crop',
]
const GREETINGS = {
  morning:   ["Rise and shine! Your cat is ready for a great day.", "Good morning! Don't forget to top up the water bowl."],
  afternoon: ["Afternoon check-in — how's your kitty doing?", "Midday reminder: a little playtime goes a long way."],
  evening:   ["Wind down time — have you given your cat some cuddles?", "Evening! A warm lap is the best thing for both of you."],
}

export default function DashboardPage() {
  const { user }                                                          = useAuth()
  const { addToast }                                                      = useToast()
  const { cats, loading: catsLoading }                                    = useCats()
  const today                                                             = new Date().toISOString().split('T')[0]
  const { tasks, loading: tasksLoading, toggleTask, completedCount }      = useTasks(null, today)
  const { records, upcoming }                                             = useVetRecords()
  const [showConfetti, setShowConfetti]                                   = useState(false)
  const prevCompleted                                                     = useRef(completedCount)

  const activeCat = cats[0]
  const heroBg    = HERO_IMGS[new Date().getHours() % HERO_IMGS.length]
  const hour      = new Date().getHours()
  const timeKey   = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const subtitle  = GREETINGS[timeKey][new Date().getDate() % 2]

  useEffect(() => {
    if (tasks.length > 0 && completedCount === tasks.length && prevCompleted.current < tasks.length) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
    prevCompleted.current = completedCount
  }, [completedCount, tasks.length])

  const handleToggle = async (id) => {
    try {
      const updated = await toggleTask(id)
      addToast(
        updated.completed ? `🐾 Done! Give ${activeCat?.name || 'your cat'} a treat!` : 'Task marked as pending',
        updated.completed ? 'success' : 'info'
      )
    } catch { addToast('Could not update task. Please try again.', 'error') }
  }

  const StatIcons = {
    cats:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-3.582-8-8 0-1.906.672-3.65 1.786-5.02C6.367 7.16 7.5 6 9 5.5c.5-1 1.5-2 3-2s2.5 1 3 2c1.5.5 2.633 1.66 3.214 2.48C19.328 9.35 20 11.094 20 13c0 4.418-3.582 8-8 8z" /></svg>,
    tasks: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    vet:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="space-y-5 pb-8">

      {/* ── HERO ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
        className="relative rounded-3xl overflow-hidden min-h-[200px]"
        style={{ border: '1px solid var(--border)' }}>
        <ConfettiBurst active={showConfetti} />
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.88), rgba(0,0,0,0.55), rgba(0,0,0,0.2))' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%)' }} />

        <div className="relative z-10 p-6 md:p-8 flex items-start justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[10px] font-black uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--emerald)' }} />
              {greeting}
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-white mb-1 leading-tight">
              {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>{subtitle}</p>

            {!tasksLoading && tasks.length > 0 && (
              <div className="p-4 rounded-2xl max-w-xs" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
                <PurrMeter completed={completedCount} total={tasks.length} />
              </div>
            )}
          </motion.div>

          {activeCat && (
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
              <Link to={`/cats/${activeCat._id}`} className="flex-shrink-0 group">
                <div className="relative">
                  <img src={activeCat.image || getCatAvatar(activeCat._id)} alt={activeCat.name}
                    className="w-20 h-20 rounded-3xl object-cover transition-all duration-300 group-hover:scale-105"
                    style={{ border: '2px solid rgba(255,255,255,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--emerald)', border: '2px solid var(--bg-card)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── STATS ── */}
      {catsLoading
        ? <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <div key={i} className="skeleton h-28" />)}</div>
        : <div className="grid grid-cols-3 gap-3">
            <StatCard icon={StatIcons.cats}  label="My Cats"     value={cats.length}     to="/cats"      delay={0.15} />
            <StatCard icon={StatIcons.tasks} label="Tasks Today" value={tasks.length}    to="/checklist" delay={0.25} />
            <StatCard icon={StatIcons.vet}   label="Vet Soon"    value={upcoming.length} to="/vet"       delay={0.35} />
          </div>
      }

      {/* ── CAT SPOTLIGHT ── */}
      {!catsLoading && activeCat && <CatSpotlight cat={activeCat} />}

      {/* ── NO CATS ── */}
      {!catsLoading && cats.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="t-card relative overflow-hidden text-center p-10"
          style={{ border: '2px dashed var(--border)' }}>
          <div className="absolute inset-0 opacity-5">
            <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: 'var(--accent-soft)' }}>🐱</div>
            <h3 className="font-display text-xl mb-2" style={{ color: 'var(--text-primary)' }}>Add your first cat</h3>
            <p className="text-sm mb-5 max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
              You haven't added any cats yet. Start tracking their daily care in seconds.
            </p>
            <Link to="/cats" className="t-btn-primary text-sm">Add a Cat →</Link>
          </div>
        </motion.div>
      )}

      {/* ── TASKS + TIMELINE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Tasks — 3/5 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
          className="t-card overflow-hidden lg:col-span-3">
          <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-soft)' }}>
            <div>
              <h2 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>Today's Tasks</h2>
              <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>{completedCount} of {tasks.length} completed</p>
            </div>
            <Link to="/checklist" className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
              style={{ color: 'var(--accent-1)', background: 'var(--accent-soft)' }}>
              View All →
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {tasksLoading && <SkeletonList count={3} />}
            {!tasksLoading && tasks.length === 0 && (
              <div className="py-10 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mx-auto mb-3" style={{ background: 'var(--accent-soft)' }}>☀️</div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>No tasks for today yet.</p>
                <Link to="/checklist" className="text-xs font-bold hover:underline mt-1 block" style={{ color: 'var(--accent-1)' }}>+ Add some tasks →</Link>
              </div>
            )}
            <AnimatePresence>
              {!tasksLoading && tasks.slice(0, 5).map((task, i) => (
                <motion.div key={task._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <TaskCard task={task} onToggle={handleToggle} />
                </motion.div>
              ))}
            </AnimatePresence>
            {tasks.length > 5 && (
              <Link to="/checklist" className="block text-center text-xs font-bold py-3 rounded-2xl transition-all"
                style={{ color: 'var(--accent-1)', background: 'var(--accent-soft)' }}>
                +{tasks.length - 5} more tasks →
              </Link>
            )}
          </div>
        </motion.div>

        {/* Timeline + upcoming — 2/5 */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <HealthTimeline records={records} />

          {upcoming.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="t-card p-5">
              <h3 className="font-display text-base mb-4" style={{ color: 'var(--text-primary)' }}>Upcoming Visits</h3>
              <div className="space-y-3">
                {upcoming.map(r => {
                  const d = new Date(r.nextVisitDate || r.date)
                  const days = Math.ceil((d - new Date()) / (1000*60*60*24))
                  return (
                    <div key={r._id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                        style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>🏥</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{r.catId?.name}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.type}</p>
                      </div>
                      <span className="text-[10px] font-black px-2 py-1 rounded-lg flex-shrink-0"
                        style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
                        {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <p className="text-center text-xs italic pb-2" style={{ color: 'var(--text-muted)' }}>
        "Mark a task done and give your cat a little treat 🐟"
      </p>

      {/* ── NOTIFICATION SETTINGS ── */}
      <NotificationSettings />

    </motion.div>
  )
}
