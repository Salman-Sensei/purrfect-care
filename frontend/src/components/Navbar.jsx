import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PAGE_META = {
  '/dashboard': 'Dashboard',
  '/cats':      'My Cats',
  '/checklist': 'Daily Tasks',
  '/vet':       'Vet Records',
  '/symptoms':  'Symptom Guide',
}

function CatLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-7 h-7 text-white" fill="currentColor">
      <path d="M10 18 L6 8 L14 13 Z" />
      <path d="M30 18 L34 8 L26 13 Z" />
      <circle cx="20" cy="20" r="9" />
      <ellipse cx="20" cy="31" rx="7" ry="6" />
      <path d="M27 33 Q36 30 35 24 Q34 20 31 21"
        strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round" />
      <circle cx="17" cy="19" r="1.2" fill="white" />
      <circle cx="23" cy="19" r="1.2" fill="white" />
    </svg>
  )
}

export default function Navbar({ darkMode, toggleDark }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const base  = '/' + pathname.split('/')[1]
  const title = PAGE_META[base] || 'Purrfect Care'

  return (
    <header className="md:hidden sticky top-0 z-20
                       bg-white/90 dark:bg-slate-900/90 backdrop-blur-md
                       border-b border-slate-100 dark:border-slate-800
                       px-4 py-3 flex items-center justify-between">
      {/* Logo + page title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700
                        flex items-center justify-center shadow-soft">
          <CatLogo />
        </div>
        <h1 className="font-display text-lg text-slate-900 dark:text-white leading-none">
          {title}
        </h1>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleDark}
          className="w-9 h-9 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800
                     flex items-center justify-center transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
               className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400">
            {darkMode
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            }
          </svg>
        </button>

        <button
          onClick={() => navigate('/cats')}
          className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-500 to-coral-500
                     flex items-center justify-center text-white font-black text-sm shadow-soft"
        >
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </button>
      </div>
    </header>
  )
}
