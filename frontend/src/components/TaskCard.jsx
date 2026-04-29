export default function TaskCard({ task, onToggle, onDelete }) {
  return (
    <div
      className="group flex items-center gap-3 p-4 rounded-2xl transition-all duration-300"
      style={{
        background: task.completed ? 'var(--accent-soft)' : 'var(--bg-card)',
        border: task.completed
          ? '1px solid var(--accent-1)'
          : '1px solid var(--border-soft)',
      }}
      onMouseEnter={e => {
        if (!task.completed) {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={e => {
        if (!task.completed) {
          e.currentTarget.style.borderColor = 'var(--border-soft)'
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      {/* Toggle circle */}
      <button
        onClick={() => onToggle(task._id)}
        className="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                   transition-all duration-300 active:scale-90 hover:scale-110"
        style={{
          background: task.completed ? 'var(--accent-1)' : 'transparent',
          borderColor: task.completed ? 'var(--accent-1)' : 'var(--text-muted)',
          boxShadow: task.completed ? '0 0 10px var(--accent-glow)' : 'none',
        }}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={3}
               style={{ animation: 'bounceIn 0.4s ease' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Emoji */}
      <span className={`text-lg flex-shrink-0 transition-all duration-300
        ${task.completed ? 'grayscale opacity-40' : ''}`}>
        {task.emoji || '📋'}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold transition-all duration-300"
          style={{
            color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: task.completed ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </p>
        {task.catId?.name && (
          <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
            🐱 {task.catId.name}
          </p>
        )}
      </div>

      {/* Done badge */}
      {task.completed && (
        <span
          className="text-[10px] font-black px-2.5 py-1 rounded-full flex-shrink-0"
          style={{
            background: 'var(--accent-soft)',
            color: 'var(--accent-2)',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          DONE ✓
        </span>
      )}

      {/* Delete on hover */}
      {onDelete && (
        <button
          onClick={() => onDelete(task._id)}
          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-xl
                     flex items-center justify-center text-sm font-bold
                     transition-all duration-200 flex-shrink-0"
          style={{
            background: 'var(--coral-soft)',
            color: 'var(--coral)',
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
