import { Link } from 'react-router-dom'
import { getCatAvatar } from '../utils/catImages'

export default function CatCard({ cat, onDelete }) {
  const avatarUrl = cat.image || getCatAvatar(cat._id)
  const color = cat.color || 'var(--accent-1)'

  return (
    <div
      className="t-card t-card-hover"
      style={{ position: 'relative', overflow: 'visible' }}
    >
      {/* Top accent line */}
      <div style={{
        height: '3px',
        background: `linear-gradient(90deg, ${color}, ${color}55)`,
        borderRadius: '1.5rem 1.5rem 0 0',
      }} />

      {/* Photo */}
      <div style={{
        height: '180px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <img
          src={avatarUrl}
          alt={cat.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          onError={e => {
            e.target.src = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80&auto=format&fit=crop'
          }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)',
        }} />
        {/* Name on photo */}
        <div style={{ position: 'absolute', bottom: '0.875rem', left: '1rem', right: '2.5rem' }}>
          <h3 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: '1.4rem',
            color: 'white',
            textShadow: '0 1px 8px rgba(0,0,0,0.4)',
            lineHeight: 1.1,
          }}>
            {cat.name}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', marginTop: '0.1rem' }}>
            {cat.breed || 'Mixed breed'} · {cat.age}
          </p>
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={() => onDelete(cat._id)}
            style={{
              position: 'absolute',
              top: '0.625rem',
              right: '0.625rem',
              width: '1.75rem',
              height: '1.75rem',
              borderRadius: '0.625rem',
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              transition: 'all 0.2s',
              opacity: 0,
            }}
            className="delete-btn"
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.7)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.35)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '1rem 1.1rem 1.25rem' }}>
        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.875rem' }}>
          {cat.weight && (
            <span className="t-badge" style={{
              background: 'var(--border-soft)', color: 'var(--text-secondary)',
            }}>
              ⚖️ {cat.weight}kg
            </span>
          )}
          {cat.healthConditions
            ? <span className="t-badge" style={{
                background: 'var(--amber-soft, rgba(212,160,23,0.1))',
                color: 'var(--amber)',
              }}>
                ⚠️ {cat.healthConditions.split(',')[0].trim()}
              </span>
            : <span className="t-badge" style={{
                background: 'var(--emerald-soft)',
                color: 'var(--emerald)',
              }}>
                💚 Healthy
              </span>
          }
        </div>

        {cat.notes && (
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            marginBottom: '0.875rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            "{cat.notes}"
          </p>
        )}

        <Link
          to={`/cats/${cat._id}`}
          className="t-btn-secondary"
          style={{
            width: '100%',
            fontSize: '0.8125rem',
            padding: '0.6rem 1rem',
            textDecoration: 'none',
          }}
        >
          View Full Profile →
        </Link>
      </div>

      {/* Show delete on hover via CSS */}
      <style>{`
        .t-card:hover .delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
