import { useState } from 'react'

const TYPES = [
  { value: 'checkup',     label: 'Checkup',     icon: '🩺' },
  { value: 'vaccination', label: 'Vaccination',  icon: '💉' },
  { value: 'dental',      label: 'Dental',       icon: '🦷' },
  { value: 'emergency',   label: 'Emergency',    icon: '🚨' },
  { value: 'other',       label: 'Other',        icon: '📋' },
]

const DEFAULTS = {
  catId: '', date: new Date().toISOString().split('T')[0],
  type: 'checkup', vetName: '', clinic: '', notes: '', nextVisitDate: ''
}

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

export default function VetForm({ cats = [], onSubmit, onCancel, loading, initial = {} }) {
  const [form, setForm] = useState({
    ...DEFAULTS,
    catId: cats[0]?._id || '',
    ...initial,
    date: initial.date ? new Date(initial.date).toISOString().split('T')[0] : DEFAULTS.date,
    nextVisitDate: initial.nextVisitDate ? new Date(initial.nextVisitDate).toISOString().split('T')[0] : '',
  })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })) }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = {}
    if (!form.catId) e2.catId = 'Please select a cat'
    if (!form.date)  e2.date  = 'Date is required'
    if (Object.keys(e2).length) { setErrors(e2); return }
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

      {/* Cat */}
      <div>
        <label style={labelStyle}>Cat *</label>
        <select
          style={{ ...inputStyle, cursor: 'pointer', borderColor: errors.catId ? 'var(--coral)' : 'var(--border)' }}
          value={form.catId}
          onChange={e => set('catId', e.target.value)}
          onFocus={e => e.target.style.borderColor = 'var(--accent-1)'}
          onBlur={e => e.target.style.borderColor = errors.catId ? 'var(--coral)' : 'var(--border)'}
        >
          <option value="" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
            Select a cat...
          </option>
          {cats.map(c => (
            <option key={c._id} value={c._id}
              style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.catId && <p style={{ color: 'var(--coral)', fontSize: '0.7rem', marginTop: '0.3rem' }}>⚠️ {errors.catId}</p>}
      </div>

      {/* Visit type grid */}
      <div>
        <label style={labelStyle}>Visit Type *</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
          {TYPES.map(({ value, label, icon }) => (
            <button
              type="button"
              key={value}
              onClick={() => set('type', value)}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '0.25rem',
                padding: '0.625rem 0.25rem',
                borderRadius: '0.75rem',
                border: '1px solid',
                borderColor: form.type === value ? 'var(--accent-1)' : 'var(--border)',
                background: form.type === value ? 'var(--accent-soft)' : 'var(--bg-card)',
                color: form.type === value ? 'var(--accent-2)' : 'var(--text-muted)',
                fontSize: '0.65rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s',
                transform: form.type === value ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={labelStyle}>Visit Date *</label>
          <input
            style={{ ...inputStyle, borderColor: errors.date ? 'var(--coral)' : 'var(--border)' }}
            type="date" value={form.date}
            onChange={e => set('date', e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--accent-1)'}
            onBlur={e => e.target.style.borderColor = errors.date ? 'var(--coral)' : 'var(--border)'}
          />
          {errors.date && <p style={{ color: 'var(--coral)', fontSize: '0.7rem', marginTop: '0.3rem' }}>⚠️ {errors.date}</p>}
        </div>
        <div>
          <label style={labelStyle}>Next Visit (optional)</label>
          <input
            style={inputStyle}
            type="date" value={form.nextVisitDate}
            onChange={e => set('nextVisitDate', e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--accent-1)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      {/* Vet + Clinic */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={labelStyle}>Vet Name</label>
          <input style={inputStyle} value={form.vetName}
            onChange={e => set('vetName', e.target.value)} placeholder="Dr. Smith"
            onFocus={e => e.target.style.borderColor = 'var(--accent-1)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <div>
          <label style={labelStyle}>Clinic</label>
          <input style={inputStyle} value={form.clinic}
            onChange={e => set('clinic', e.target.value)} placeholder="Happy Paws Clinic"
            onFocus={e => e.target.style.borderColor = 'var(--accent-1)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label style={labelStyle}>Notes</label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: '96px', lineHeight: '1.6', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="What did the vet say? Any medications or follow-up care needed?"
          onFocus={e => { e.target.style.borderColor = 'var(--accent-1)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
        <button type="submit" disabled={loading} className="t-btn-primary"
          style={{ flex: 1, opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Saving...' : initial._id ? '💾 Update Record' : '🏥 Save Record'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="t-btn-secondary">
            Cancel
          </button>
        )}
      </div>

      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5) opacity(0.7); cursor: pointer; }
        select option { background: var(--bg-surface) !important; color: var(--text-primary) !important; }
        select {
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239ba5be' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem !important;
        }
      `}</style>
    </form>
  )
}
