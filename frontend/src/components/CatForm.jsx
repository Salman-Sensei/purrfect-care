import { useState } from 'react'

const COLORS  = ['#6366f1','#7c3aed','#db2777','#ea580c','#16a34a','#0891b2','#dc2626','#ca8a04','#0d9488','#9333ea']
const BREEDS  = ['','Persian','Maine Coon','Siamese','Ragdoll','British Shorthair','Bengal','Sphynx','Scottish Fold','Abyssinian','Russian Blue','Norwegian Forest','Mixed breed']
const DEFAULTS = { name:'', age:'', breed:'', weight:'', healthConditions:'', allergies:'', notes:'', image:'', color:'#6366f1' }

// Shared input style using CSS vars
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

function Field({ label, error, children }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '0.6875rem',
        fontWeight: 800,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: '0.4rem',
      }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ color: 'var(--coral)', fontSize: '0.7rem', marginTop: '0.3rem' }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  )
}

export default function CatForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm]     = useState({ ...DEFAULTS, ...initial })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })) }

  const validate = () => {
    const e = {}

    // Name
    if (!form.name.trim())                 e.name = 'Cat name is required'
    else if (form.name.trim().length < 2)  e.name = 'Name must be at least 2 characters'
    else if (form.name.trim().length > 50) e.name = 'Name must be 50 characters or less'

    // Age — must be a number between 0 and 30
    if (form.age === '' || form.age === null || form.age === undefined) {
      e.age = 'Age is required'
    } else {
      const numericAge = parseFloat(form.age)
      if (isNaN(numericAge))       e.age = 'Age must be a number'
      else if (numericAge < 0)     e.age = 'Age cannot be negative'
      else if (numericAge > 30)    e.age = 'Please enter a realistic age (max 30 years)'
    }

    // Weight — optional but must be valid if provided
    if (form.weight !== '' && form.weight !== null && form.weight !== undefined) {
      const w = parseFloat(form.weight)
      if (isNaN(w))    e.weight = 'Weight must be a number'
      else if (w < 0)  e.weight = 'Weight cannot be negative'
      else if (w > 30) e.weight = 'Weight seems too high (max 30kg)'
    }

    // Image URL — optional but must be valid if provided
    if (form.image.trim()) {
      try { new URL(form.image.trim()) }
      catch { e.image = 'Please enter a valid URL (starting with https://)' }
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) onSubmit(form)
  }

  // Returns border color based on error + focus state via CSS class instead of inline style fighting
  const fieldStyle = (key) => ({
    ...inputStyle,
    borderColor: errors[key] ? 'var(--coral)' : 'var(--border)',
    boxShadow: 'none',
  })

  const onFocus = (key) => (e) => {
    e.target.style.borderColor = errors[key] ? 'var(--coral)' : 'var(--accent-1)'
    e.target.style.boxShadow   = `0 0 0 3px ${errors[key] ? 'rgba(239,68,68,0.15)' : 'var(--accent-soft)'}`
  }
  const onBlur = (key) => (e) => {
    e.target.style.borderColor = errors[key] ? 'var(--coral)' : 'var(--border)'
    e.target.style.boxShadow   = 'none'
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

      {/* Color picker */}
      <div>
        <label style={{
          display: 'block', fontSize: '0.6875rem', fontWeight: 800,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--text-muted)', marginBottom: '0.5rem',
        }}>
          Cat Colour Theme
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <button
              type="button"
              key={c}
              onClick={() => set('color', c)}
              style={{
                width: '2rem', height: '2rem',
                borderRadius: '0.5rem',
                background: c,
                border: form.color === c ? '2px solid white' : '2px solid transparent',
                outline: form.color === c ? `3px solid ${c}` : 'none',
                outlineOffset: '2px',
                transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.15s',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* Name + Age */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Field label="Cat Name *" error={errors.name}>
          <input
            style={fieldStyle('name')}
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Luna"
            autoFocus
            onFocus={onFocus('name')}
            onBlur={onBlur('name')}
          />
        </Field>
        <Field label="Age (years) *" error={errors.age}>
          <input
            style={fieldStyle('age')}
            type="number"
            min="0"
            max="30"
            step="0.5"
            value={form.age}
            onChange={e => set('age', e.target.value)}
            placeholder="e.g. 3"
            onFocus={onFocus('age')}
            onBlur={onBlur('age')}
          />
        </Field>
      </div>

      {/* Breed + Weight */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Field label="Breed">
          <select
            style={{ ...inputStyle, cursor: 'pointer' }}
            value={form.breed}
            onChange={e => set('breed', e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--accent-1)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          >
            {BREEDS.map(b => (
              <option key={b} value={b}
                style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                {b || 'Select breed...'}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Weight (kg)" error={errors.weight}>
          <input
            style={fieldStyle('weight')}
            type="number" step="0.1" min="0" max="30"
            value={form.weight}
            onChange={e => set('weight', e.target.value)}
            placeholder="e.g. 4.2"
            onFocus={onFocus('weight')}
            onBlur={onBlur('weight')}
          />
        </Field>
      </div>

      {/* Health */}
      <Field label="Health Conditions">
        <input
          style={inputStyle}
          value={form.healthConditions}
          onChange={e => set('healthConditions', e.target.value)}
          placeholder="e.g. diabetes, asthma (leave blank if none)"
          onFocus={e => e.target.style.borderColor = 'var(--accent-1)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </Field>

      {/* Allergies */}
      <Field label="Allergies">
        <input
          style={inputStyle}
          value={form.allergies}
          onChange={e => set('allergies', e.target.value)}
          placeholder="e.g. chicken, pollen (leave blank if none)"
          onFocus={e => e.target.style.borderColor = 'var(--accent-1)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </Field>

      {/* Photo URL */}
      <Field label="Photo URL (optional)" error={errors.image}>
        <input
          style={fieldStyle('image')}
          value={form.image}
          onChange={e => set('image', e.target.value)}
          placeholder="https://..."
          type="url"
          onFocus={onFocus('image')}
          onBlur={onBlur('image')}
        />
        {form.image && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <img src={form.image} alt="Preview"
              style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Image preview</p>
          </div>
        )}
      </Field>

      {/* Notes */}
      <Field label="Notes">
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: '96px', lineHeight: '1.6', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Anything special about this cat — favourite toys, quirks, routines..."
          onFocus={e => { e.target.style.borderColor = 'var(--accent-1)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
        />
      </Field>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
        <button
          type="submit"
          disabled={loading}
          className="t-btn-primary flex-1"
          style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading
            ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <span style={{
                  width: '1rem', height: '1rem',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
                Saving...
              </span>
            : initial._id ? '💾 Update Cat' : '🐱 Add Cat'
          }
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="t-btn-secondary"
            style={{ minWidth: '5rem' }}
          >
            Cancel
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input::placeholder, textarea::placeholder { color: var(--text-muted) !important; }
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
