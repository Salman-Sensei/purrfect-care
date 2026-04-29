import { createContext, useContext, useState, useEffect } from 'react'

export const THEMES = {

  // ── LIGHT THEMES ──────────────────────────────────────────────────────────

  blossom: {
    id: 'blossom',
    name: 'Blossom',
    emoji: '🌸',
    desc: 'Soft warm light',
    dark: false,
    vars: {
      '--bg-base':        '#fdf8f5',
      '--bg-surface':     '#ffffff',
      '--bg-card':        '#ffffff',
      '--bg-card-hover':  '#fef4ef',
      '--border':         '#f0e6df',
      '--border-soft':    '#f5ede7',
      '--text-primary':   '#2d1f1a',
      '--text-secondary': '#7c5c52',
      '--text-muted':     '#b89990',
      '--accent-1':       '#e06b4a',
      '--accent-2':       '#f0956e',
      '--accent-glow':    'rgba(224,107,74,0.2)',
      '--accent-soft':    'rgba(224,107,74,0.08)',
      '--coral':          '#e05252',
      '--coral-soft':     'rgba(224,82,82,0.08)',
      '--emerald':        '#2e9e6b',
      '--emerald-soft':   'rgba(46,158,107,0.1)',
      '--amber':          '#d48a1a',
      '--shadow':         '0 2px 16px rgba(160,80,40,0.08)',
      '--shadow-hover':   '0 8px 32px rgba(160,80,40,0.14)',
    },
  },

  pearl: {
    id: 'pearl',
    name: 'Pearl',
    emoji: '🤍',
    desc: 'Clean cool white',
    dark: false,
    vars: {
      '--bg-base':        '#f6f8fc',
      '--bg-surface':     '#ffffff',
      '--bg-card':        '#ffffff',
      '--bg-card-hover':  '#f0f4ff',
      '--border':         '#e4eaf5',
      '--border-soft':    '#edf1f9',
      '--text-primary':   '#1a1f36',
      '--text-secondary': '#5a6480',
      '--text-muted':     '#9ba5be',
      '--accent-1':       '#5b6af7',
      '--accent-2':       '#7f8df9',
      '--accent-glow':    'rgba(91,106,247,0.18)',
      '--accent-soft':    'rgba(91,106,247,0.07)',
      '--coral':          '#f06060',
      '--coral-soft':     'rgba(240,96,96,0.08)',
      '--emerald':        '#2ba870',
      '--emerald-soft':   'rgba(43,168,112,0.1)',
      '--amber':          '#d4a017',
      '--shadow':         '0 2px 16px rgba(60,80,160,0.07)',
      '--shadow-hover':   '0 8px 32px rgba(60,80,160,0.13)',
    },
  },

  // ── DARK THEMES ───────────────────────────────────────────────────────────

  midnight: {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    desc: 'Deep navy & violet',
    dark: true,
    vars: {
      '--bg-base':        '#0c0e1a',
      '--bg-surface':     '#12152a',
      '--bg-card':        '#181c35',
      '--bg-card-hover':  '#1d2240',
      '--border':         '#242848',
      '--border-soft':    '#1c2040',
      '--text-primary':   '#e8eaf6',
      '--text-secondary': '#8892c8',
      '--text-muted':     '#484e80',
      '--accent-1':       '#7c6af7',
      '--accent-2':       '#a89bfa',
      '--accent-glow':    'rgba(124,106,247,0.28)',
      '--accent-soft':    'rgba(124,106,247,0.1)',
      '--coral':          '#f97066',
      '--coral-soft':     'rgba(249,112,102,0.1)',
      '--emerald':        '#34d399',
      '--emerald-soft':   'rgba(52,211,153,0.1)',
      '--amber':          '#fbbf24',
      '--shadow':         '0 4px 24px rgba(0,0,0,0.4)',
      '--shadow-hover':   '0 12px 40px rgba(0,0,0,0.55)',
    },
  },

  forest: {
    id: 'forest',
    name: 'Forest',
    emoji: '🌿',
    desc: 'Dark sage & earth',
    dark: true,
    vars: {
      '--bg-base':        '#0b1410',
      '--bg-surface':     '#101a14',
      '--bg-card':        '#152019',
      '--bg-card-hover':  '#1a2820',
      '--border':         '#1d3025',
      '--border-soft':    '#182820',
      '--text-primary':   '#e2ede5',
      '--text-secondary': '#72a882',
      '--text-muted':     '#3d6449',
      '--accent-1':       '#4ade80',
      '--accent-2':       '#86efac',
      '--accent-glow':    'rgba(74,222,128,0.25)',
      '--accent-soft':    'rgba(74,222,128,0.09)',
      '--coral':          '#fb923c',
      '--coral-soft':     'rgba(251,146,60,0.1)',
      '--emerald':        '#4ade80',
      '--emerald-soft':   'rgba(74,222,128,0.1)',
      '--amber':          '#facc15',
      '--shadow':         '0 4px 24px rgba(0,0,0,0.4)',
      '--shadow-hover':   '0 12px 40px rgba(0,0,0,0.55)',
    },
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    desc: 'Deep teal & cyan',
    dark: true,
    vars: {
      '--bg-base':        '#040e1a',
      '--bg-surface':     '#081422',
      '--bg-card':        '#0c1c30',
      '--bg-card-hover':  '#10243c',
      '--border':         '#142b44',
      '--border-soft':    '#102038',
      '--text-primary':   '#d8f0f8',
      '--text-secondary': '#5aa0c0',
      '--text-muted':     '#2e5e7a',
      '--accent-1':       '#22d3ee',
      '--accent-2':       '#67e8f9',
      '--accent-glow':    'rgba(34,211,238,0.25)',
      '--accent-soft':    'rgba(34,211,238,0.09)',
      '--coral':          '#f97316',
      '--coral-soft':     'rgba(249,115,22,0.1)',
      '--emerald':        '#2dd4bf',
      '--emerald-soft':   'rgba(45,212,191,0.1)',
      '--amber':          '#fbbf24',
      '--shadow':         '0 4px 24px rgba(0,0,0,0.4)',
      '--shadow-hover':   '0 12px 40px rgba(0,0,0,0.55)',
    },
  },

  ember: {
    id: 'ember',
    name: 'Ember',
    emoji: '🔥',
    desc: 'Warm amber & dark',
    dark: true,
    vars: {
      '--bg-base':        '#130a00',
      '--bg-surface':     '#1a1000',
      '--bg-card':        '#231600',
      '--bg-card-hover':  '#2c1e00',
      '--border':         '#3a2400',
      '--border-soft':    '#2e1c00',
      '--text-primary':   '#fef0d8',
      '--text-secondary': '#cc8e42',
      '--text-muted':     '#7a4a18',
      '--accent-1':       '#f59e0b',
      '--accent-2':       '#fcd34d',
      '--accent-glow':    'rgba(245,158,11,0.28)',
      '--accent-soft':    'rgba(245,158,11,0.09)',
      '--coral':          '#ef4444',
      '--coral-soft':     'rgba(239,68,68,0.1)',
      '--emerald':        '#10b981',
      '--emerald-soft':   'rgba(16,185,129,0.1)',
      '--amber':          '#f59e0b',
      '--shadow':         '0 4px 24px rgba(0,0,0,0.4)',
      '--shadow-hover':   '0 12px 40px rgba(0,0,0,0.55)',
    },
  },
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(
    () => localStorage.getItem('purrfect_theme') || 'pearl'
  )

  const theme = THEMES[themeId] || THEMES.pearl

  useEffect(() => {
    const root = document.documentElement
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v))
    root.setAttribute('data-theme', themeId)
    root.setAttribute('data-dark', theme.dark ? 'true' : 'false')
    localStorage.setItem('purrfect_theme', themeId)
  }, [themeId, theme])

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme: (id) => THEMES[id] && setThemeId(id), themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}
