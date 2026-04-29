import { useState } from 'react'
import { useTheme, THEMES } from '../context/ThemeContext'

export default function ThemeSwitcher() {
  const { themeId, setTheme, theme } = useTheme()
  const [open, setOpen] = useState(false)

  const lightThemes = Object.values(THEMES).filter(t => !t.dark)
  const darkThemes  = Object.values(THEMES).filter(t => t.dark)

  const panelStyle = {
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    zIndex: 50,
    borderRadius: '1.25rem',
    padding: '1rem',
    background: 'var(--bg-surface)',
    border: '1.5px solid var(--border)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)',
    animation: 'slideDown 0.2s ease',
  }

  const ThemeBtn = ({ t }) => (
    <button
      onClick={() => { setTheme(t.id); setOpen(false) }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        width: '100%',
        padding: '0.6rem 0.75rem',
        borderRadius: '0.875rem',
        border: '1.5px solid',
        borderColor: themeId === t.id ? 'var(--accent-1)' : 'transparent',
        background: themeId === t.id ? 'var(--accent-soft)' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s',
        textAlign: 'left',
      }}
      onMouseEnter={e => {
        if (themeId !== t.id) e.currentTarget.style.background = 'var(--border-soft)'
      }}
      onMouseLeave={e => {
        if (themeId !== t.id) e.currentTarget.style.background = 'transparent'
      }}
    >
      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{t.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '0.8125rem', fontWeight: 700,
          color: themeId === t.id ? 'var(--accent-1)' : 'var(--text-primary)',
          lineHeight: 1,
        }}>
          {t.name}
        </p>
        <p style={{
          fontSize: '0.65rem', color: 'var(--text-muted)',
          marginTop: '0.15rem',
        }}>
          {t.desc}
        </p>
      </div>
      {themeId === t.id && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
             style={{ width: '0.875rem', height: '0.875rem', color: 'var(--accent-1)', flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
    </button>
  )

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          width: '100%',
          padding: '0.625rem 0.75rem',
          borderRadius: '0.875rem',
          border: 'none',
          background: open ? 'var(--accent-soft)' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'var(--border-soft)' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent' }}
      >
        {/* Swatch */}
        <div style={{
          width: '2rem', height: '2rem',
          borderRadius: '0.625rem',
          background: 'var(--bg-card-hover)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem',
          flexShrink: 0,
        }}>
          {theme.emoji}
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', lineHeight: 1 }}>
            Theme
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--accent-1)', fontWeight: 700, marginTop: '0.15rem' }}>
            {theme.name}
          </p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             style={{
               width: '0.875rem', height: '0.875rem',
               color: 'var(--text-muted)',
               transform: open ? 'rotate(180deg)' : 'rotate(0)',
               transition: 'transform 0.2s',
               flexShrink: 0,
             }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={panelStyle}>
            {/* Light themes */}
            <p style={{
              fontSize: '0.6rem', fontWeight: 900,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--text-muted)', padding: '0 0.5rem', marginBottom: '0.4rem',
            }}>
              ☀️ Light
            </p>
            <div style={{ marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              {lightThemes.map(t => <ThemeBtn key={t.id} t={t} />)}
            </div>

            {/* Dark themes */}
            <p style={{
              fontSize: '0.6rem', fontWeight: 900,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--text-muted)', padding: '0 0.5rem', marginBottom: '0.4rem',
              borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem',
            }}>
              🌙 Dark
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              {darkThemes.map(t => <ThemeBtn key={t.id} t={t} />)}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
