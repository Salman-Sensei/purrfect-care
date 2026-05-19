import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { CAT_LOGIN } from '../utils/catImages'

export default function AuthPage() {
  const [mode, setMode]             = useState('login')
  const [form, setForm]             = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors]         = useState({})
  const [loading, setLoading]       = useState(false)
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { login, signup, isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })) }

  // Password strength checker
  const getPasswordStrength = (pwd) => {
    if (!pwd) return null
    let score = 0
    if (pwd.length >= 6)  score++
    if (pwd.length >= 10) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    if (score <= 1) return { label: 'Weak',   color: '#ef4444', width: '25%'  }
    if (score <= 2) return { label: 'Fair',   color: '#f97316', width: '50%'  }
    if (score <= 3) return { label: 'Good',   color: '#f59e0b', width: '75%'  }
    return               { label: 'Strong', color: '#10b981', width: '100%' }
  }

  const strength = mode === 'signup' ? getPasswordStrength(form.password) : null

  const validate = () => {
    const e = {}

    if (mode === 'signup') {
      // Name
      if (!form.name.trim())
        e.name = 'Your name is required'
      else if (form.name.trim().length < 2)
        e.name = 'Name must be at least 2 characters'
      else if (form.name.trim().length > 50)
        e.name = 'Name must be 50 characters or less'
      else if (!/^[a-zA-Z\s'-]+$/.test(form.name.trim()))
        e.name = 'Name can only contain letters, spaces, hyphens and apostrophes'
    }

    // Email
    if (!form.email.trim())
      e.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = 'Enter a valid email address'
    else if (form.email.length > 100)
      e.email = 'Email is too long'

    // Password
    if (!form.password)
      e.password = 'Password is required'
    else if (mode === 'signup') {
      if (form.password.length < 6)
        e.password = 'Password must be at least 6 characters'
      else if (form.password.length > 128)
        e.password = 'Password is too long'
      else if (/^\s+|\s+$/.test(form.password))
        e.password = 'Password cannot start or end with spaces'
    }

    // Confirm password (signup only)
    if (mode === 'signup') {
      if (!form.confirmPassword)
        e.confirmPassword = 'Please confirm your password'
      else if (form.password !== form.confirmPassword)
        e.confirmPassword = 'Passwords do not match'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      if (mode === 'login') {
        const data = await login(form.email, form.password)
        addToast(`Welcome back, ${data.name?.split(' ')[0]}! 🐾`, 'success')
      } else {
        const data = await signup(form.name, form.email, form.password)
        addToast(`Welcome to Purrfect Care, ${data.name?.split(' ')[0]}! 😸`, 'success')
      }
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.'
      addToast(msg, 'error')
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg })
      else if (msg.toLowerCase().includes('password')) setErrors({ password: msg })
    } finally { setLoading(false) }
  }

  const switchMode = (m) => {
    setMode(m)
    setErrors({})
    setForm({ name: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>

      {/* LEFT — luxury cat photo panel */}
      <div style={{ display: 'none' }} className="auth-left-panel">
        <img src={CAT_LOGIN} alt="Beautiful cat"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(49,46,129,0.85) 0%, rgba(67,56,202,0.65) 50%, rgba(79,70,229,0.45) 100%)'
        }} />
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.07,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext y='40' font-size='30' opacity='1'%3E🐾%3C/text%3E%3C/svg%3E\")",
          backgroundSize: '80px 80px'
        }} />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '3rem' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem',
              background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
            }}>🐾</div>
            <div>
              <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '1.3rem', color: 'white', fontWeight: 600 }}>Purrfect Care</p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Cat Care Companion</p>
            </div>
          </div>

          {/* Hero copy */}
          <div>
            <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '3.2rem', color: 'white', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              Every cat<br />deserves<br /><em style={{ color: '#a5b4fc' }}>great care.</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '22rem' }}>
              Track daily care, vet visits, and health records — all in one beautiful place.
            </p>
            <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
              {[{ n: '10k+', l: 'Happy cats' }, { n: '98%', l: 'Satisfaction' }, { n: '24/7', l: 'Available' }].map(({ n, l }) => (
                <div key={l} style={{
                  background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                  borderRadius: '1rem', padding: '1rem', textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.18)'
                }}>
                  <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '1.4rem', color: 'white', fontWeight: 700 }}>{n}</p>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem', marginTop: '0.2rem' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.8rem', fontStyle: 'italic' }}>
            "You're doing great — your cat is lucky to have you." 🐱
          </p>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem', background: 'var(--bg-base)', position: 'relative',
        backgroundImage: 'radial-gradient(ellipse at 25% 15%, rgba(91,106,247,0.07) 0%, transparent 55%), radial-gradient(ellipse at 75% 85%, rgba(224,107,74,0.05) 0%, transparent 55%)',
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
          style={{ width: '100%', maxWidth: '440px' }}>

          {/* Mobile logo */}
          <div className="auth-mobile-logo" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.875rem', background: 'var(--accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: 'white', boxShadow: '0 4px 14px var(--accent-glow)' }}>🐾</div>
            <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '1.5rem', color: 'var(--text-primary)' }}>Purrfect Care</span>
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '1.5rem', padding: '2rem',
            boxShadow: '0 8px 40px rgba(60,80,160,0.13), 0 2px 8px rgba(0,0,0,0.04)',
          }}>

            {/* Tab toggle */}
            <div style={{
              display: 'flex', background: 'var(--bg-base)', border: '1px solid var(--border)',
              borderRadius: '1rem', padding: '0.25rem', marginBottom: '1.75rem', gap: '0.25rem',
            }}>
              {['login', 'signup'].map(m => (
                <button key={m} onClick={() => switchMode(m)}
                  style={{
                    flex: 1, padding: '0.625rem', borderRadius: '0.75rem',
                    fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                    transition: 'all 0.25s ease', fontFamily: 'inherit',
                    background: mode === m ? 'var(--bg-card)' : 'transparent',
                    color: mode === m ? 'var(--accent-1)' : 'var(--text-muted)',
                    boxShadow: mode === m ? '0 2px 8px rgba(60,80,160,0.10)' : 'none',
                  }}>
                  {m === 'login' ? '🔑 Sign In' : '✨ Create Account'}
                </button>
              ))}
            </div>

            {/* Heading */}
            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '1.9rem', color: 'var(--text-primary)', marginBottom: '0.3rem', fontWeight: 700 }}>
                  {mode === 'login' ? 'Welcome back!' : 'Join the family'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {mode === 'login' ? 'Your cats are waiting for you 🐾' : 'Start caring smarter, not harder.'}
                </p>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div key="name-field" initial={{ opacity: 0, height: 0, y: -8 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    <label style={labelStyle}>Your Name</label>
                    <input
                      style={{ ...fieldStyle, borderColor: errors.name ? 'var(--coral)' : 'var(--border)' }}
                      value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="e.g. Alex Johnson" autoComplete="name"
                      onFocus={e => { e.target.style.borderColor = errors.name ? 'var(--coral)' : 'var(--accent-1)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)' }}
                      onBlur={e => { e.target.style.borderColor = errors.name ? 'var(--coral)' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
                    />
                    {errors.name && <p style={errorStyle}>⚠️ {errors.name}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  style={{ ...fieldStyle, borderColor: errors.email ? 'var(--coral)' : 'var(--border)' }}
                  type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com" autoComplete="email"
                  onFocus={e => { e.target.style.borderColor = errors.email ? 'var(--coral)' : 'var(--accent-1)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)' }}
                  onBlur={e => { e.target.style.borderColor = errors.email ? 'var(--coral)' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
                {errors.email && <p style={errorStyle}>⚠️ {errors.email}</p>}
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...fieldStyle, borderColor: errors.password ? 'var(--coral)' : 'var(--border)', paddingRight: '3rem' }}
                    type={showPass ? 'text' : 'password'}
                    value={form.password} onChange={e => set('password', e.target.value)}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    onFocus={e => { e.target.style.borderColor = errors.password ? 'var(--coral)' : 'var(--accent-1)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)' }}
                    onBlur={e => { e.target.style.borderColor = errors.password ? 'var(--coral)' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0.2rem' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Password strength bar — signup only */}
                {mode === 'signup' && form.password && strength && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ height: '4px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '2px', transition: 'width 0.3s, background 0.3s' }} />
                    </div>
                    <p style={{ fontSize: '0.68rem', marginTop: '0.25rem', color: strength.color, fontWeight: 700 }}>
                      {strength.label} password
                    </p>
                  </div>
                )}
                {errors.password && <p style={errorStyle}>⚠️ {errors.password}</p>}
              </div>

              {/* Confirm password — signup only */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div key="confirm-field" initial={{ opacity: 0, height: 0, y: -8 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    <label style={labelStyle}>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        style={{ ...fieldStyle, borderColor: errors.confirmPassword ? 'var(--coral)' : form.confirmPassword && form.password === form.confirmPassword ? '#10b981' : 'var(--border)', paddingRight: '3rem' }}
                        type={showConfirm ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={e => set('confirmPassword', e.target.value)}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        onFocus={e => { e.target.style.borderColor = errors.confirmPassword ? 'var(--coral)' : 'var(--accent-1)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)' }}
                        onBlur={e => { e.target.style.borderColor = errors.confirmPassword ? 'var(--coral)' : form.confirmPassword && form.password === form.confirmPassword ? '#10b981' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
                      />
                      <button type="button" onClick={() => setShowConfirm(s => !s)}
                        style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0.2rem' }}>
                        {showConfirm ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {/* Match indicator */}
                    {form.confirmPassword && !errors.confirmPassword && (
                      <p style={{ fontSize: '0.68rem', marginTop: '0.25rem', fontWeight: 700,
                        color: form.password === form.confirmPassword ? '#10b981' : 'var(--coral)' }}>
                        {form.password === form.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                      </p>
                    )}
                    {errors.confirmPassword && <p style={errorStyle}>⚠️ {errors.confirmPassword}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '0.875rem', marginTop: '0.25rem',
                  borderRadius: '0.875rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? 'var(--text-muted)' : 'var(--accent-1)',
                  color: 'white', fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  boxShadow: loading ? 'none' : '0 4px 14px var(--accent-glow)',
                  transform: 'translateY(0)',
                }}>
                {loading
                  ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                      {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </span>
                  : mode === 'login' ? 'Sign In 🐾' : 'Create Account ✨'
                }
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {mode === 'login' ? 'New here? ' : 'Already have an account? '}
                <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-1)', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit', padding: 0 }}>
                  {mode === 'login' ? 'Create a free account' : 'Sign in instead'}
                </button>
              </p>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            🔒 Your data is private and secure
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (min-width: 1024px) {
          .auth-left-panel { display: flex !important; flex-direction: column; width: 52%; position: relative; overflow: hidden; }
          .auth-mobile-logo { display: none !important; }
        }
        @media (max-width: 1023px) {
          .auth-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem',
}
const fieldStyle = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: '0.875rem',
  border: '1.5px solid var(--border)', background: 'var(--bg-base)',
  color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'inherit',
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
}
const errorStyle = {
  color: 'var(--coral)', fontSize: '0.72rem', marginTop: '0.35rem',
  display: 'flex', alignItems: 'center', gap: '0.25rem',
}
