import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CAT_SYMPTOM } from '../utils/catImages'

const QUICK_SYMPTOMS = [
  'Vomiting', 'Hiding', 'Not eating', 'Scratching',
  'Limping', 'Diarrhea', 'Sneezing', 'Seizure',
  'Blood in stool', 'Breathing trouble',
]

function UserBubble({ text }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] bg-brand-600 text-white rounded-3xl rounded-br-md px-4 py-3 text-sm leading-relaxed shadow-sm">
        {text}
      </div>
    </div>
  )
}

function DrPawsBubble({ reply, needsVet, vets, loading }) {
  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm flex-shrink-0 shadow">
        🩺
      </div>

      <div className="flex-1 space-y-3">
        {loading ? (
          <div className="flex gap-1.5 items-center px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-3xl rounded-tl-md w-fit">
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--accent-1)',
                animation: `bounce 1s ease-in-out ${i * 0.18}s infinite`,
              }} />
            ))}
          </div>
        ) : (
          <>
            {/* Response bubble */}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl rounded-tl-md px-4 py-3 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Dr. Paws</span>
                {needsVet !== undefined && (
                  needsVet
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-bold">Vet Recommended</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 font-bold">Home Care OK</span>
                )}
              </div>
              {reply}
            </div>

            {/* Vet links */}
            {needsVet && vets && vets.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <p className="text-xs text-slate-400 px-1">🏥 Nearby vets — tap to open in Google Maps</p>
                {vets.map((vet, i) => (
                  <motion.a
                    key={i}
                    href={vet.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-300 transition-all no-underline block"
                  >
                    <span className="text-base flex-shrink-0">📍</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{vet.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{vet.address}</p>
                      <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-1">Open in Google Maps →</p>
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const STORAGE_KEY = 'drpaws_chat'

const defaultMessages = [
  {
    role: 'assistant',
    reply: "Hi! I'm Dr. Paws 🐾 Describe your cat's symptoms and I'll give you professional guidance. You can type freely or tap a quick symptom below.",
    needsVet: undefined,
    vets: [],
  }
]

function loadMessages() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : defaultMessages
  } catch {
    return defaultMessages
  }
}

export default function SymptomHelperPage() {
  const [messages, setMessages] = useState(loadMessages)
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef(null)

  // Persist messages to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {}
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return

    const userMsg = { role: 'user', text, content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Build history from previous messages for multi-turn context
    const history = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        role: m.role,
        content: m.role === 'user' ? m.text : m.reply,
      }))

    try {
      const token = localStorage.getItem('purrfect_token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/vet-assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ input: text.trim(), history }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed')

      setMessages(prev => [...prev, {
        role: 'assistant',
        reply: data.reply,
        needsVet: data.needsVet,
        vets: data.vets || [],
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        reply: "Sorry, I couldn't process that right now. Please try again in a moment.",
        needsVet: false,
        vets: [],
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickPick = (symptom) => {
    sendMessage(symptom)
  }

  const clearChat = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setMessages(defaultMessages)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col space-y-4 pb-8 max-w-2xl"
    >
      {/* Hero */}
      <div className="card overflow-hidden relative">
        <div className="absolute inset-0">
          <img src={CAT_SYMPTOM} alt="Cat looking curious" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-700/50" />
        </div>
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">AI Powered</p>
              <h1 className="font-display text-3xl text-white mb-2">Symptom Guide</h1>
              <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                Chat with Dr. Paws — describe your cat's symptoms and get professional guidance instantly.
              </p>
            </div>
            <div className="text-5xl flex-shrink-0 animate-float">🩺</div>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div className="card dark:bg-slate-900 flex flex-col" style={{ minHeight: '420px' }}>
        {/* Messages */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Dr. Paws Consultation</span>
          {messages.length > 1 && (
            <button onClick={clearChat} className="text-xs text-slate-400 hover:text-red-400 transition-colors">
              Clear chat
            </button>
          )}
        </div>
        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ maxHeight: '420px' }}>
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.role === 'user'
                  ? <UserBubble text={msg.text} />
                  : <DrPawsBubble reply={msg.reply} needsVet={msg.needsVet} vets={msg.vets} />
                }
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading bubble */}
          {loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <DrPawsBubble loading />
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-800" />

        {/* Quick symptom chips */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-xs text-slate-400 mb-2 font-semibold">Quick symptoms</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SYMPTOMS.map(s => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.93 }}
                type="button"
                disabled={loading}
                onClick={() => handleQuickPick(s)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300
                           hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:text-brand-700 dark:hover:text-brand-300
                           border border-slate-200 dark:border-slate-700 hover:border-brand-300
                           transition-all font-semibold disabled:opacity-50"
              >
                {s}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 pt-2">
          <input
            type="text"
            className="input flex-1 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe your cat's symptoms..."
            disabled={loading}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-primary px-4 disabled:opacity-50"
          >
            Send
          </motion.button>
        </form>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </motion.div>
  )
}
