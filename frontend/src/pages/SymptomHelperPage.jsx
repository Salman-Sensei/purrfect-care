import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CAT_SYMPTOM } from '../utils/catImages'

const RULES = [
  { keywords:['vomit','throw up','puking','sick','nausea','throwing up'],   title:'Vomiting',           level:'warning',
    advice:'Occasional vomiting can be normal — often hairballs. Withhold food for 2–4 hrs then offer bland food. If vomiting persists beyond 24 hours, contains blood, or your cat seems lethargic, contact your vet.',
    when:'Call your vet if: more than 3× in 24 hours, blood present, or severe lethargy.' },
  { keywords:['scratch','itch','itching','skin','fur loss','bald patch'],    title:'Scratching/Itching', level:'info',
    advice:'Scratching often means fleas, allergies, or dry skin. Check for flea dirt on the coat. If scratching creates open sores or significant hair loss, a vet visit is needed.',
    when:'See a vet if: open wounds, major hair loss, or you spot parasites.' },
  { keywords:['hiding','hide','withdrawn','isolated','under bed','not moving'], title:'Hiding/Withdrawal', level:'warning',
    advice:"Cats hide when stressed or unwell. A few hours is normal after stressful events. More than 24 hours with food/water refusal needs attention.",
    when:"Call if: hiding 24+ hours, refusing food and water, or combined with other symptoms." },
  { keywords:["not eating","won't eat","refusing food","no appetite","lost appetite","anorexia"], title:'Not Eating', level:'warning',
    advice:'Skipping one meal is OK. But cats should not go without food 24–48+ hours — it can cause fatty liver disease (hepatic lipidosis) which is serious.',
    urgent:true, when:'Call the vet if: not eating for more than 24 hours, especially with lethargy.' },
  { keywords:['blood','bleeding','bloody','red urine','blood in stool','bloody stool','bloody urine'], title:'Blood', level:'emergency',
    advice:'Any visible blood — in urine, stool, or vomit — requires immediate vet attention. Do not wait.',
    urgent:true, when:'🚨 EMERGENCY — contact your vet or emergency animal clinic immediately.' },
  { keywords:['breathing','breathe','gasping','wheezing','coughing','can\'t breathe','open mouth'], title:'Breathing Difficulty', level:'emergency',
    advice:'Difficulty breathing is a medical emergency. Open-mouth breathing, rapid shallow breaths, or blue-tinged gums are critical signs.',
    urgent:true, when:'🚨 EMERGENCY — get to a vet immediately, do not delay.' },
  { keywords:['limp','limping','leg','paw','injured paw','won\'t walk','can\'t walk','swollen leg'], title:'Limping/Injury', level:'warning',
    advice:'A limping cat may have a sprain, fracture, or wound. Check the paw for cuts. Avoid letting them jump. Seek care if limping is severe or persists 24+ hours.',
    when:'See vet if: sudden/severe limp, obvious swelling, or no improvement after a day.' },
  { keywords:['diarrhea','loose stool','watery stool','runny poop'],          title:'Diarrhea',           level:'warning',
    advice:'Occasional diarrhea can result from diet changes or stress. Keep water available. If it lasts 2+ days or contains blood, see a vet.',
    when:'Call if: lasting over 2 days, blood present, or combined with lethargy.' },
  { keywords:['seizure','convulsion','shaking','trembling','fitting','twitching uncontrolled'], title:'Seizure/Convulsions', level:'emergency',
    advice:'Keep your cat away from furniture. Do not restrain them during a seizure. Time it if possible.',
    urgent:true, when:'🚨 EMERGENCY — contact a vet immediately after any seizure.' },
  { keywords:['thirst','drinking a lot','drinking too much','excessive water','urinating a lot'], title:'Excessive Thirst', level:'info',
    advice:'Drinking much more than usual can signal diabetes, kidney disease, or hyperthyroidism. Note how much they drink and schedule a vet visit for a blood/urine test.',
    when:'Schedule a vet visit within a week if excessive thirst persists, especially with weight loss.' },
  { keywords:['sneezing','sneeze','runny nose','eye discharge','watery eyes'],  title:'Cold Symptoms',     level:'info',
    advice:'Sneezing and eye discharge can indicate a feline upper respiratory infection (cat cold). Keep them warm and hydrated. Most resolve in 7–10 days, but kittens need faster care.',
    when:'See vet if: symptoms persist over 10 days, appetite lost, or high fever.' },
  { keywords:['overweight','obese','fat','not moving much','inactive','lazy'], title:'Weight/Activity',   level:'info',
    advice:'Weight gain and reduced activity in cats can signal hypothyroidism, arthritis, or heart issues — not just laziness. A vet wellness check is a good idea.',
    when:'Schedule a wellness check if weight gain is sudden or activity drops noticeably.' },
]

const LEVEL_STYLE = {
  info:      { bg:'bg-blue-50 dark:bg-blue-900/20', border:'border-blue-200 dark:border-blue-800', text:'text-blue-800 dark:text-blue-300', badge:'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400', icon:'ℹ️', label:'Non-Urgent' },
  warning:   { bg:'bg-amber-50 dark:bg-amber-900/20', border:'border-amber-200 dark:border-amber-800', text:'text-amber-800 dark:text-amber-300', badge:'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400', icon:'⚠️', label:'Monitor Closely' },
  emergency: { bg:'bg-red-50 dark:bg-red-900/20', border:'border-red-300 dark:border-red-700', text:'text-red-800 dark:text-red-300', badge:'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400', icon:'🚨', label:'Emergency!' },
}

const QUICK_SYMPTOMS = ['Vomiting','Hiding','Not eating','Scratching','Limping','Diarrhea','Sneezing','Seizure','Blood in stool','Breathing trouble']

export default function SymptomHelperPage() {
  const [query, setQuery]         = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults]     = useState([])

  const analyze = (q) => {
    const lower = q.toLowerCase()
    const found = RULES.filter(r => r.keywords.some(k => lower.includes(k)))
    setResults(found)
    setSubmitted(true)
  }

  const handleSubmit = (e) => { e.preventDefault(); if (query.trim()) analyze(query) }
  const reset = () => { setQuery(''); setSubmitted(false); setResults([]) }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
      className="space-y-5 pb-8 max-w-2xl">

      {/* Hero */}
      <div className="card overflow-hidden relative">
        <div className="absolute inset-0">
          <img src={CAT_SYMPTOM} alt="Cat looking curious" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-700/50" />
        </div>
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Quick Reference</p>
              <h1 className="font-display text-3xl text-white mb-2">Symptom Guide</h1>
              <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                Describe what your cat is doing and get instant guidance on whether to call the vet.
              </p>
            </div>
            <div className="text-5xl flex-shrink-0 animate-float">🔍</div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-3 items-start p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <span className="text-xl flex-shrink-0">⚠️</span>
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong>Not medical advice.</strong> This guide uses predefined rules for reference only. For serious, urgent, or unclear symptoms, always contact your veterinarian immediately.
        </p>
      </div>

      {/* Search card */}
      <div className="card p-6 dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">What's your cat doing?</label>
            <textarea className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white resize-none text-sm mt-1" rows={3}
              value={query} onChange={e => { setQuery(e.target.value); setSubmitted(false) }}
              placeholder={'e.g. "My cat has been hiding all day and won\'t eat"\n"My cat keeps vomiting and seems lethargic"'}
            />
          </div>

          {/* Quick symptom chips */}
          <div>
            <p className="label mb-2">Common symptoms — tap to check</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SYMPTOMS.map(s => (
                <motion.button whileTap={{ scale: 0.93 }} type="button" key={s}
                  onClick={() => { setQuery(s); analyze(s) }}
                  className="text-xs px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300
                             hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:text-brand-700 dark:hover:text-brand-300
                             border border-slate-200 dark:border-slate-700 hover:border-brand-300
                             transition-all font-semibold">
                  {s}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={!query.trim()} className="btn-primary flex-1">
              Analyze Symptoms 🔍
            </motion.button>
            {submitted && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                type="button" onClick={reset} className="btn-secondary">
                Clear
              </motion.button>
            )}
          </div>
        </form>
      </div>

      {/* Results */}
      <AnimatePresence>
        {submitted && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {results.length === 0
              ? <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="card p-8 text-center dark:bg-slate-900">
                  <p className="text-4xl mb-3">🤔</p>
                  <p className="font-display text-xl text-slate-700 dark:text-slate-300 mb-2">No matching symptoms found</p>
                  <p className="text-sm text-slate-400 mb-4">Try different wording, or use one of the quick buttons above.</p>
                  <p className="text-sm font-bold text-coral-600 dark:text-coral-400">When in doubt, call your vet — they'd rather hear from you! 🩺</p>
                </motion.div>
              : <>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 px-1">
                    Found {results.length} matching result{results.length > 1 ? 's' : ''}:
                  </p>
                  {results.map((r, i) => {
                    const s = LEVEL_STYLE[r.level]
                    return (
                      <motion.div key={r.title}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, ease: [0.22,1,0.36,1] }}
                        className={`rounded-3xl border p-6 ${s.bg} ${s.border}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl">{s.icon}</span>
                          <div className="flex-1">
                            <h3 className={`font-display text-xl ${s.text}`}>{r.title}</h3>
                          </div>
                          <span className={`badge text-xs ${s.badge}`}>{s.label}</span>
                        </div>
                        <p className={`text-sm leading-relaxed mb-4 ${s.text} opacity-90`}>{r.advice}</p>
                        <div className={`text-xs font-bold ${s.text} bg-white/50 dark:bg-black/20 rounded-xl px-4 py-3 flex items-start gap-2`}>
                          <span className="flex-shrink-0 mt-0.5">📞</span>
                          <span>{r.when}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </>
            }

            {/* Footer disclaimer */}
            <div className="card p-5 text-center dark:bg-slate-900">
              <p className="text-xs text-slate-400 leading-relaxed">
                This guide uses predefined rules and is for reference only. For any serious or persistent symptoms, always contact your veterinarian.{' '}
                <strong className="text-slate-500">When in doubt, call — vets would rather hear from a cautious owner!</strong> 🩺
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
