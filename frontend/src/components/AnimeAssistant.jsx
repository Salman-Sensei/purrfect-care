import { useRef, useEffect, useState, useCallback } from 'react'
import AssistantChat from './AssistantChat'

/* ── Inline SVG cat character ──────────────────────────────────────────────
   A cute minimal anime-style cat drawn in pure SVG — no external assets.
   Eyes are refs so we can animate them with transforms.
────────────────────────────────────────────────────────────────────────── */
function CatSVG({ mood, eyeOffset, isBlinking }) {
  // mood: 'idle' | 'happy' | 'talking'
  const eyeStyle = (side) => ({
    transform: `translate(${eyeOffset.x * (side === 'left' ? 1 : 1)}px, ${eyeOffset.y}px)`,
    transition: 'transform 0.08s linear',
  })

  return (
    <svg
      viewBox="0 0 120 140"
      width="90"
      height="105"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 8px 24px rgba(91,106,247,0.35))' }}
    >
      {/* ── Ears ── */}
      <polygon points="18,52 32,20 46,52" fill="var(--accent-1)" />
      <polygon points="74,52 88,20 102,52" fill="var(--accent-1)" />
      <polygon points="22,50 32,28 42,50" fill="#ffb3c6" />
      <polygon points="78,50 88,28 98,50" fill="#ffb3c6" />

      {/* ── Head ── */}
      <ellipse cx="60" cy="75" rx="46" ry="42" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />

      {/* ── Eyes group (offset by mouse) ── */}
      <g style={eyeStyle('left')}>
        {isBlinking ? (
          <ellipse cx="42" cy="72" rx="10" ry="2.5" fill="var(--text-primary)" />
        ) : (
          <>
            <ellipse cx="42" cy="72" rx="10" ry={mood === 'happy' ? 7 : 9} fill="white" />
            <ellipse cx="42" cy="72" rx="6"  ry={mood === 'happy' ? 5 : 7} fill="#5b6af7" />
            <ellipse cx="42" cy="72" rx="3.5" ry={mood === 'happy' ? 3 : 5} fill="#1a1f36" />
            <ellipse cx="40" cy="70" rx="1.5" ry="1.5" fill="white" />
            {/* Happy eye curve */}
            {mood === 'happy' && (
              <path d="M33 72 Q42 64 51 72" fill="none" stroke="var(--accent-1)" strokeWidth="1.5" opacity="0.5" />
            )}
          </>
        )}
      </g>

      <g style={eyeStyle('right')}>
        {isBlinking ? (
          <ellipse cx="78" cy="72" rx="10" ry="2.5" fill="var(--text-primary)" />
        ) : (
          <>
            <ellipse cx="78" cy="72" rx="10" ry={mood === 'happy' ? 7 : 9} fill="white" />
            <ellipse cx="78" cy="72" rx="6"  ry={mood === 'happy' ? 5 : 7} fill="#5b6af7" />
            <ellipse cx="78" cy="72" rx="3.5" ry={mood === 'happy' ? 3 : 5} fill="#1a1f36" />
            <ellipse cx="76" cy="70" rx="1.5" ry="1.5" fill="white" />
            {mood === 'happy' && (
              <path d="M69 72 Q78 64 87 72" fill="none" stroke="var(--accent-1)" strokeWidth="1.5" opacity="0.5" />
            )}
          </>
        )}
      </g>

      {/* ── Nose ── */}
      <ellipse cx="60" cy="87" rx="4" ry="3" fill="#ffb3c6" />

      {/* ── Mouth ── */}
      {mood === 'talking' ? (
        <ellipse cx="60" cy="96" rx="8" ry="5" fill="var(--bg-base)" stroke="var(--text-secondary)" strokeWidth="1" />
      ) : mood === 'happy' ? (
        <path d="M50 93 Q60 103 70 93" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <path d="M53 93 Q60 99 67 93" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
      )}

      {/* ── Whiskers ── */}
      <line x1="10" y1="84" x2="38" y2="88" stroke="var(--text-muted)" strokeWidth="1" opacity="0.6" />
      <line x1="10" y1="90" x2="38" y2="90" stroke="var(--text-muted)" strokeWidth="1" opacity="0.6" />
      <line x1="10" y1="96" x2="38" y2="92" stroke="var(--text-muted)" strokeWidth="1" opacity="0.6" />
      <line x1="82" y1="88" x2="110" y2="84" stroke="var(--text-muted)" strokeWidth="1" opacity="0.6" />
      <line x1="82" y1="90" x2="110" y2="90" stroke="var(--text-muted)" strokeWidth="1" opacity="0.6" />
      <line x1="82" y1="92" x2="110" y2="96" stroke="var(--text-muted)" strokeWidth="1" opacity="0.6" />

      {/* ── Body / paws ── */}
      <ellipse cx="60" cy="128" rx="30" ry="14" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />
      <ellipse cx="42" cy="133" rx="10" ry="7" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />
      <ellipse cx="78" cy="133" rx="10" ry="7" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />

      {/* ── Paw toe lines ── */}
      <line x1="38" y1="135" x2="38" y2="138" stroke="var(--border)" strokeWidth="1" />
      <line x1="42" y1="136" x2="42" y2="139" stroke="var(--border)" strokeWidth="1" />
      <line x1="46" y1="135" x2="46" y2="138" stroke="var(--border)" strokeWidth="1" />
      <line x1="74" y1="135" x2="74" y2="138" stroke="var(--border)" strokeWidth="1" />
      <line x1="78" y1="136" x2="78" y2="139" stroke="var(--border)" strokeWidth="1" />
      <line x1="82" y1="135" x2="82" y2="138" stroke="var(--border)" strokeWidth="1" />

      {/* ── Blush (happy only) ── */}
      {mood === 'happy' && (
        <>
          <ellipse cx="28" cy="82" rx="8" ry="4" fill="#ffb3c6" opacity="0.5" />
          <ellipse cx="92" cy="82" rx="8" ry="4" fill="#ffb3c6" opacity="0.5" />
        </>
      )}
    </svg>
  )
}

/* ── lerp helper ── */
const lerp = (a, b, t) => a + (b - a) * t

export default function AnimeAssistant() {
  const [chatOpen,   setChatOpen]   = useState(false)
  const [mood,       setMood]       = useState('idle')   // idle | happy | talking
  const [isBlinking, setIsBlinking] = useState(false)
  const [hovered,    setHovered]    = useState(false)
  const [eyeOffset,  setEyeOffset]  = useState({ x: 0, y: 0 })

  /* positions tracked via refs to avoid re-renders in rAF loop */
  const floatRef    = useRef({ y: 0, vy: 0, phase: 0 })
  const mouseRef    = useRef({ x: window.innerWidth - 120, y: window.innerHeight - 160 })
  const currentRef  = useRef({ x: window.innerWidth - 120, y: window.innerHeight - 160 })
  const wrapRef     = useRef(null)
  const rafRef      = useRef(null)
  const eyeRafRef   = useRef(null)

  /* ── Mouse tracking ── */
  useEffect(() => {
    const onMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  /* ── Main animation loop: float + position ── */
  useEffect(() => {
    let t = 0
    const tick = () => {
      t += 0.025
      const floatY = Math.sin(t) * 7  // gentle bob

      // Lerp current position toward target (bottom-right anchor)
      // The character stays fixed; only the eyes/slight tilt tracks mouse
      if (wrapRef.current) {
        wrapRef.current.style.transform = `translateY(${floatY}px)`
      }

      // Eye tracking: map mouse position relative to character center
      const rect = wrapRef.current?.getBoundingClientRect()
      if (rect) {
        const cx = rect.left + rect.width / 2
        const cy = rect.top  + rect.height / 2
        const dx = mouseRef.current.x - cx
        const dy = mouseRef.current.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = 300
        const factor = Math.min(dist / maxDist, 1) * 2.5
        setEyeOffset({
          x: (dx / (dist || 1)) * factor,
          y: (dy / (dist || 1)) * factor,
        })
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  /* ── Random blink ── */
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 3500
      return setTimeout(() => {
        setIsBlinking(true)
        setTimeout(() => setIsBlinking(false), 140)
        blinkTimer = scheduleBlink()
      }, delay)
    }
    let blinkTimer = scheduleBlink()
    return () => clearTimeout(blinkTimer)
  }, [])

  /* ── Mood transitions ── */
  useEffect(() => {
    if (chatOpen) setMood('happy')
    else          setMood('idle')
  }, [chatOpen])

  const handleClick = useCallback(() => {
    setChatOpen(p => !p)
  }, [])

  return (
    <>
      {/* ── Fixed container bottom-right ── */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.75rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.75rem',
          pointerEvents: 'none',
        }}
      >
        {/* Chat window */}
        {chatOpen && (
          <div style={{ pointerEvents: 'all' }}>
            <AssistantChat
              onClose={() => setChatOpen(false)}
              onBotTyping={() => setMood('talking')}
              onBotDone={() => setMood('happy')}
            />
          </div>
        )}

        {/* Character */}
        <div
          ref={wrapRef}
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            pointerEvents: 'all',
            cursor: 'pointer',
            transform: 'translateY(0px)',
            transition: 'filter 0.2s ease',
            filter: hovered
              ? 'drop-shadow(0 0 18px rgba(91,106,247,0.6))'
              : 'drop-shadow(0 8px 24px rgba(91,106,247,0.25))',
            scale: hovered ? '1.08' : '1',
          }}
        >
          <CatSVG mood={mood} eyeOffset={eyeOffset} isBlinking={isBlinking} />

          {/* Notification dot when chat closed */}
          {!chatOpen && (
            <div style={{
              position: 'absolute',
              top: '4px',
              right: '8px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'var(--accent-1)',
              border: '2px solid var(--bg-base)',
              animation: 'assistantPulse 2s ease-in-out infinite',
            }} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes assistantPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.3); opacity: 0.7; }
        }
      `}</style>
    </>
  )
}
