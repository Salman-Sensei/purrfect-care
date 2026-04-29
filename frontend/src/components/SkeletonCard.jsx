export function SkeletonCard({ lines = 3, hasImage = false }) {
  return (
    <div className="t-card p-5 space-y-3">
      {hasImage && <div className="skeleton h-40 w-full" style={{ borderRadius: '1rem' }} />}
      <div className="flex items-center gap-3">
        <div className="skeleton w-12 h-12" style={{ borderRadius: '0.75rem', flexShrink: 0 }} />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4" style={{ width: '75%', borderRadius: '0.5rem' }} />
          <div className="skeleton h-3" style={{ width: '50%', borderRadius: '0.5rem' }} />
        </div>
      </div>
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className="skeleton h-3" style={{
          width: i % 2 === 0 ? '100%' : '83%',
          borderRadius: '0.5rem',
        }} />
      ))}
    </div>
  )
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-2xl"
             style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}>
          <div className="skeleton w-6 h-6 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 rounded-xl" style={{ width: i % 3 === 0 ? '66%' : '75%' }} />
            <div className="skeleton h-3 rounded-xl" style={{ width: '33%' }} />
          </div>
          <div className="skeleton w-14 h-5 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}
