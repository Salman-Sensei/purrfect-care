import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../services/api'

const STORAGE_KEY = 'purrfect_assistant_history'
const MAX_HISTORY = 10

/* ── Typing indicator ── */
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 0' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: 'var(--accent-1)',
          display: 'inline-block',
          animation: `assistantBounce 1s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
    </div>
  )
}

/* ── Single message bubble ── */
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '0.625rem',
      animation: 'assistantFadeUp 0.25s ease both',
    }}>
      {!isUser && (
        <div style={{
          width: '26px', height: '26px', borderRadius: '50%',
          background: 'var(--accent-1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', marginRight: '6px', flexShrink: 0,
          marginTop: '2px',
        }}>🐾</div>
      )}
      <div style={{
        maxWidth: '78%',
        padding: '0.5rem 0.75rem',
        borderRadius: isUser ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
        background: isUser
          ? 'var(--accent-1)'
          : 'var(--bg-card)',
        color: isUser ? 'white' : 'var(--text-primary)',
        fontSize: '0.8125rem',
        lineHeight: '1.5',
        border: isUser ? 'none' : '1px solid var(--border)',
        wordBreak: 'break-word',
        boxShadow: isUser
          ? '0 2px 8px rgba(91,106,247,0.3)'
          : '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

export default function AssistantChat({ onClose, onBotTyping, onBotDone }) {
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const scrollRef   = useRef(null)
  const inputRef    = useRef(null)

  /* ── Load history from localStorage ── */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      if (saved.length > 0) {
        setMessages(saved)
      } else {
        // Greeting on first open
        setMessages([{
          role: 'assistant',
          content: "Meow! 🐾 I'm Mochi, your Purrfect Care assistant! I can help with cat care tips, schedules, health questions and more. What's on your mind?",
          id: Date.now(),
        }])
      }
    } catch {
      setMessages([])
    }
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  /* ── Auto-scroll to bottom ── */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  /* ── Persist messages ── */
  useEffect(() => {
    if (messages.length === 0) return
    try {
      const toSave = messages.slice(-MAX_HISTORY)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch {}
  }, [messages])

  /* ── Send message ── */
  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    onBotTyping?.()

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      const res = await api.post('/assistant/chat', {
        message: text,
        history,
      })
      const botMsg = {
        role: 'assistant',
        content: res.data.reply,
        id: Date.now() + 1,
      }
      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      const fallback = {
        role: 'assistant',
        content: "Purr... I'm having trouble connecting right now 🐱 Please try again in a moment!",
        id: Date.now() + 1,
      }
      setMessages(prev => [...prev, fallback])
    } finally {
      setLoading(false)
      onBotDone?.()
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [input, loading, messages, onBotTyping, onBotDone])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY)
    setMessages([{
      role: 'assistant',
      content: "Fresh start! 🌿 How can I help you and your cat today?",
      id: Date.now(),
    }])
  }

  return (
    <div style={{
      width: '320px',
      height: '420px',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '1.5rem',
      overflow: 'hidden',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(91,106,247,0.12)',
      animation: 'assistantSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.875rem 1rem',
        background: 'var(--accent-1)',
        flexShrink: 0,
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px',
        }}>🐾</div>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1 }}>Mochi</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6875rem', marginTop: '2px' }}>
            {loading ? '✍️ typing...' : '● Online'}
          </p>
        </div>
        <button
          onClick={clearHistory}
          title="Clear history"
          style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer',
            color: 'white', borderRadius: '0.5rem', padding: '4px 8px', fontSize: '0.7rem',
            fontFamily: 'inherit', fontWeight: 600,
          }}
        >
          Clear
        </button>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer',
            color: 'white', borderRadius: '0.5rem', width: '28px', height: '28px',
            fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit',
          }}
        >×</button>
      </div>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.875rem',
          display: 'flex',
          flexDirection: 'column',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border) transparent',
        }}
      >
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {loading && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            marginBottom: '0.5rem',
            animation: 'assistantFadeUp 0.2s ease both',
          }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: 'var(--accent-1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px',
            }}>🐾</div>
            <div style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '1.25rem 1.25rem 1.25rem 0.25rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}>
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* ── Quick suggestions ── */}
      {messages.length <= 1 && !loading && (
        <div style={{ padding: '0 0.875rem 0.5rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {['Cat food tips 🍣', 'Grooming help 🛁', 'Vet schedule 🏥'].map(s => (
            <button key={s} onClick={() => setInput(s.replace(/\s*[🍣🛁🏥]/, ''))}
              style={{
                fontSize: '0.6875rem', padding: '0.25rem 0.625rem',
                borderRadius: '9999px', border: '1px solid var(--border)',
                background: 'var(--bg-base)', color: 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--accent-1)'; e.target.style.color = 'var(--accent-1)' }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)' }}
            >{s}</button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
        background: 'var(--bg-base)',
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask me anything… 🐱"
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.5rem 0.875rem',
            borderRadius: '9999px',
            border: '1.5px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.8125rem',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent-1)'}
          onBlur={e  => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: input.trim() && !loading ? 'var(--accent-1)' : 'var(--border)',
            border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            color: 'white', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', flexShrink: 0,
            boxShadow: input.trim() && !loading ? '0 4px 12px var(--accent-glow)' : 'none',
          }}
        >
          {loading ? (
            <span style={{
              width: '14px', height: '14px',
              border: '2px solid rgba(255,255,255,0.4)',
              borderTopColor: 'white', borderRadius: '50%',
              display: 'inline-block',
              animation: 'assistantSpin 0.7s linear infinite',
            }} />
          ) : '➤'}
        </button>
      </div>
    </div>
  )
}
