import { useState, useEffect } from 'react'

const EMOJIS = ['🐟','🥣','💧','🪣','💊','🛁','🧸','🏃','😺','🌙','☀️','💝','🎾','🐭','🌿']
const PRESETS = [
  { label: 'Morning feed',     emoji: '🥣' },
  { label: 'Evening feed',     emoji: '🐟' },
  { label: 'Fresh water',      emoji: '💧' },
  { label: 'Litter box clean', emoji: '🪣' },
  { label: 'Medication',       emoji: '💊' },
  { label: 'Play time',        emoji: '🎾' },
  { label: 'Brushing',         emoji: '🛁' },
  { label: 'Cuddle time',      emoji: '💝' },
]

const inputStyle = {
  width: '100%',
  padding: '0.72rem 1rem',
  borderRadius: '0.875rem',
  border: '1.5px solid var(--border)',
  background: 'var(--bg-base)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: '0.6875rem',
  fontWeight: 800,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '0.4rem',
}

export default function TaskForm({ cats = [], onSubmit, onCancel, loading, defaultCatId = '' }) {
  const [form, setForm] = useState({
    catId: defaultCatId || '',
    title: '',
    emoji: '🐟',
    date:  new Date().toISOString().split('T')[0],
  })
  const [errors, setErrors] = useState({})

  // cats load async — fill catId once they arrive
  useEffect(() => {
    if (!form.catId && cats.length > 0) {
      setForm(p => ({ ...p, catId: defaultCatId || cats[0]._id }))
    }
  }, [cats, defaultCatId])

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })) }

  // Clicking a preset fills the title input — user can still edit it freely
  const pickPreset = (label, emoji) => {
    setForm(p => ({ ...p, title: label, emoji }))
    setErrors(p => ({ ...p, title: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = {}
    if (cats.length > 1 && !form.catId) e2.catId = 'Please select a cat'
    if (!form.title.trim()) e2.title = 'Please enter a task name'
    if (Object.keys(e2).length) { setErrors(e2); return }
    onSubmit(form)
  }

  // Only block on catId when the multi-cat selector is actually visible
  const cantSubmit = loading || !form.title.trim() || (cats.length > 1 && !form.catId)

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

      {/* Cat selector — only when multiple cats */}
      {cats.length > 1 && (
        <div>
          <label style={labelStyle}>For which cat?</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {cats.map(c => (
              <button
                type="button"
                key={c._id}
                onClick={() => set('catId', c._id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid',
                  borderColor: form.catId === c._id ? 'var(--accent-1)' : 'var(--border)',
                  background: form.catId === c._id ? 'var(--accent-soft)' : 'var(--bg-card)',
                  color: form.catId === c._id ? 'var(--accent-2)' : 'var(--text-secondary)',
                  fontSize: '0.875rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                🐱 {c.name}
              </button>
            ))}
          </div>
          {errors.catId && <p style={{ color: 'var(--coral)', fontSize: '0.7rem', marginTop: '0.3rem' }}>⚠️ {errors.catId}</p>}
        </div>
      )}

      {/* Quick pick presets */}
      <div>
        <label style={labelStyle}>Quick Pick</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {PRESETS.map(({ label, emoji }) => (
            <button
              type="button"
              key={label}
              onClick={() => pickPreset(label, emoji)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 0.875rem',
                borderRadius: '0.75rem',
                border: '1px solid',
                borderColor: form.title === label ? 'var(--accent-1)' : 'var(--border)',
                background: form.title === label ? 'var(--accent-soft)' : 'var(--bg-card)',
                color: form.title === label ? 'var(--accent-2)' : 'var(--text-secondary)',
                fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{emoji}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ALWAYS-VISIBLE task name input — removed the custom/toggle pattern entirely */}
      <div>
        <label style={labelStyle}>Task Name</label>
        <input
          style={{
            ...inputStyle,
            borderColor: errors.title ? 'var(--coral)' : 'var(--border)',
          }}
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="Pick a preset above, or type your own…"
          onFocus={e => {
            e.target.style.borderColor = 'var(--accent-1)'
            e.target.style.boxShadow   = '0 0 0 3px var(--accent-soft)'
          }}
          onBlur={e => {
            e.target.style.borderColor = errors.title ? 'var(--coral)' : 'var(--border)'
            e.target.style.boxShadow   = 'none'
          }}
        />
        {errors.title && (
          <p style={{ color: 'var(--coral)', fontSize: '0.7rem', marginTop: '0.3rem' }}>
            ⚠️ {errors.title}
          </p>
        )}
      </div>

      {/* Emoji picker */}
      <div>
        <label style={labelStyle}>Icon</label>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {EMOJIS.map(em => (
            <button
              type="button"
              key={em}
              onClick={() => set('emoji', em)}
              style={{
                width: '2.5rem', height: '2.5rem',
                borderRadius: '0.75rem',
                fontSize: '1.2rem',
                border: '1px solid',
                borderColor: form.emoji === em ? 'var(--accent-1)' : 'var(--border)',
                background: form.emoji === em ? 'var(--accent-soft)' : 'var(--bg-card)',
                cursor: 'pointer',
                transform: form.emoji === em ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.15s',
              }}
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label style={labelStyle}>Date</label>
        <input
          style={inputStyle}
          type="date"
          value={form.date}
          onChange={e => set('date', e.target.value)}
          onFocus={e => {
            e.target.style.borderColor = 'var(--accent-1)'
            e.target.style.boxShadow   = '0 0 0 3px var(--accent-soft)'
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.boxShadow   = 'none'
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
        <button
          type="submit"
          disabled={cantSubmit}
          className="t-btn-primary"
          style={{ flex: 1, opacity: cantSubmit ? 0.5 : 1 }}
        >
          {loading ? 'Adding...' : '📋 Add Task'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="t-btn-secondary">
            Cancel
          </button>
        )}
      </div>

      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5) opacity(0.7); cursor: pointer; }
      `}</style>
    </form>
  )
}
