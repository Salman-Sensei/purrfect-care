import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeSwitcher from './ThemeSwitcher'

const Icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  cats:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-3.582-8-8 0-1.906.672-3.65 1.786-5.02C6.367 7.16 7.5 6 9 5.5c.5-1 1.5-2 3-2s2.5 1 3 2c1.5.5 2.633 1.66 3.214 2.48C19.328 9.35 20 11.094 20 13c0 4.418-3.582 8-8 8z" /></svg>,
  checklist: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  vet:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  symptoms:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
  shop:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
  logout:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>,
}

const NAV = [
  { to: '/dashboard', label: 'Dashboard',    desc: 'Overview',       icon: Icons.dashboard },
  { to: '/cats',      label: 'My Cats',       desc: 'Profiles',       icon: Icons.cats      },
  { to: '/checklist', label: 'Daily Tasks',   desc: 'Checklist',      icon: Icons.checklist },
  { to: '/vet',       label: 'Vet Records',   desc: 'Health history', icon: Icons.vet       },
  { to: '/products',  label: 'Shop',          desc: 'Product picks',  icon: Icons.shop      },
  { to: '/symptoms',  label: 'Symptom Guide', desc: 'Quick help',     icon: Icons.symptoms  },
]

function CatLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-6 h-6 text-white" fill="currentColor">
      <path d="M10 18 L6 8 L14 13 Z" />
      <path d="M30 18 L34 8 L26 13 Z" />
      <circle cx="20" cy="20" r="9" />
      <ellipse cx="20" cy="31" rx="7" ry="6" />
      <path d="M27 33 Q36 30 35 24 Q34 20 31 21" strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round" />
      <circle cx="17" cy="19" r="1.2" fill="white" />
      <circle cx="23" cy="19" r="1.2" fill="white" />
    </svg>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 h-full z-30"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative flex flex-col h-full">

        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border-soft)' }}>
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/dashboard')}
          >
            <div
              className="relative w-10 h-10 rounded-2xl flex items-center justify-center
                         shadow-lg group-hover:scale-105 transition-all duration-300"
              style={{ background: 'var(--accent-1)', boxShadow: '0 4px 16px var(--accent-glow)' }}
            >
              <CatLogo />
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: '0 0 20px var(--accent-glow)' }}
              />
            </div>
            <div>
              <p className="font-display text-base font-semibold leading-none"
                 style={{ color: 'var(--text-primary)' }}>
                Purrfect
              </p>
              <p className="text-[9px] font-black tracking-[0.25em] uppercase mt-0.5"
                 style={{ color: 'var(--accent-1)' }}>
                Care
              </p>
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="mx-3 mt-4 p-3.5 rounded-2xl"
          style={{
            background: 'var(--accent-soft)',
            border: '1px solid var(--border)',
          }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center
                         text-white font-black text-sm flex-shrink-0"
              style={{ background: 'var(--accent-1)' }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate leading-tight"
                 style={{ color: 'var(--text-primary)' }}>
                {user?.name}
              </p>
              <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {user?.email}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full flex-shrink-0"
                 style={{ background: 'var(--emerald)' }} />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] px-3 mb-3"
             style={{ color: 'var(--text-muted)' }}>
            Navigation
          </p>

          {NAV.map(({ to, label, desc, icon }) => (
            <NavLink
              key={to}
              to={to}
              className="block"
            >
              {({ isActive }) => (
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl
                             transition-all duration-200 cursor-pointer group"
                  style={{
                    background: isActive ? 'var(--accent-soft)' : 'transparent',
                    border: isActive ? '1px solid var(--accent-1)' : '1px solid transparent',
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                               transition-all duration-200"
                    style={{
                      background: isActive ? 'var(--accent-1)' : 'var(--bg-card)',
                      color: isActive ? 'white' : 'var(--text-muted)',
                      boxShadow: isActive ? '0 4px 12px var(--accent-glow)' : 'none',
                    }}
                  >
                    {icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold leading-none"
                      style={{ color: isActive ? 'var(--accent-2)' : 'var(--text-secondary)' }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-[10px] mt-0.5"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {desc}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                         style={{ background: 'var(--accent-1)' }} />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 space-y-1" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <ThemeSwitcher />

          <button
            onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl
                       transition-all duration-200 group"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center
                         transition-all group-hover:bg-red-500/10"
              style={{ background: 'var(--bg-card)' }}
            >
              {Icons.logout}
            </span>
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
