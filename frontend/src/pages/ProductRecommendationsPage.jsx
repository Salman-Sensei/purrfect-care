import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCats } from '../hooks/useCats'
import api from '../services/api'

// ── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'food',     label: 'Food & Nutrition', icon: '🍣', desc: 'Dry, wet, treats & supplements' },
  { id: 'grooming', label: 'Grooming',          icon: '✂️', desc: 'Brushes, shampoos & nail care'  },
  { id: 'toys',     label: 'Toys & Play',       icon: '🎾', desc: 'Interactive & solo play toys'   },
  { id: 'health',   label: 'Health & Wellness', icon: '💊', desc: 'Vitamins, probiotics & calming' },
  { id: 'bedding',  label: 'Beds & Comfort',    icon: '🛏️', desc: 'Beds, caves & cosy spots'      },
]

const COUNTRIES = [
  { code: 'PK', label: '🇵🇰 Pakistan'      },
  { code: 'US', label: '🇺🇸 United States'  },
  { code: 'GB', label: '🇬🇧 United Kingdom' },
  { code: 'CA', label: '🇨🇦 Canada'         },
  { code: 'AU', label: '🇦🇺 Australia'      },
  { code: 'AE', label: '🇦🇪 UAE'            },
  { code: 'IN', label: '🇮🇳 India'          },
  { code: 'DE', label: '🇩🇪 Germany'        },
]

// ── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, index }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="card overflow-hidden group"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{
        background: `hsl(${(index * 47 + 220) % 360}, 70%, 60%)`
      }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent-1)' }}>
                {product.brand}
              </span>
              {product.priceRange && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                  {product.priceRange}
                </span>
              )}
            </div>
            <h3 className="font-bold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
              {product.name}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'var(--accent-soft)', border: '1px solid var(--border)' }}>
            🛍️
          </div>
        </div>

        {/* Description */}
        <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {product.description}
        </p>

        {/* Why this cat */}
        {product.why && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-xl"
            style={{ background: 'var(--accent-soft)', border: '1px solid var(--border)' }}>
            <span className="text-base flex-shrink-0">🐱</span>
            <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {product.why}
            </p>
          </div>
        )}

        {/* Purchase links */}
        {product.links?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Buy Online
            </p>
            <div className="flex flex-wrap gap-2">
              {product.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{
                    background: i === 0 ? 'var(--accent-1)' : 'var(--bg-card)',
                    color: i === 0 ? 'white' : 'var(--text-primary)',
                    border: `1px solid ${i === 0 ? 'transparent' : 'var(--border)'}`,
                    boxShadow: i === 0 ? '0 2px 8px var(--accent-glow)' : 'none',
                  }}
                >
                  🛒 {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="card p-5 space-y-3 animate-pulse">
      <div className="h-1 w-full rounded" style={{ background: 'var(--border)' }} />
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full" style={{ background: 'var(--border)' }} />
        <div className="h-5 w-12 rounded-full" style={{ background: 'var(--border)' }} />
      </div>
      <div className="h-5 w-3/4 rounded" style={{ background: 'var(--border)' }} />
      <div className="h-4 w-full rounded" style={{ background: 'var(--border)' }} />
      <div className="h-4 w-5/6 rounded" style={{ background: 'var(--border)' }} />
      <div className="h-10 w-full rounded-xl mt-2" style={{ background: 'var(--border)' }} />
      <div className="flex gap-2 mt-2">
        <div className="h-8 w-20 rounded-xl" style={{ background: 'var(--border)' }} />
        <div className="h-8 w-20 rounded-xl" style={{ background: 'var(--border)' }} />
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductRecommendationsPage() {
  const { cats, loading: catsLoading } = useCats()

  const [selectedCat,      setSelectedCat]      = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [customCategory,   setCustomCategory]   = useState('')
  const [country,          setCountry]          = useState('PK')
  const [products,         setProducts]         = useState([])
  const [loading,          setLoading]          = useState(false)
  const [error,            setError]            = useState('')
  const [catName,          setCatName]          = useState('')
  const [searched,         setSearched]         = useState(false)

  // Auto-select first cat
  useEffect(() => {
    if (cats.length > 0 && !selectedCat) {
      setSelectedCat(cats[0]._id)
    }
  }, [cats, selectedCat])

  // Try to detect country from browser locale
  useEffect(() => {
    try {
      const locale = navigator.language || navigator.languages?.[0] || ''
      const region = new Intl.Locale(locale).region
      if (region && COUNTRIES.find(c => c.code === region)) {
        setCountry(region)
      }
    } catch {
      // keep default
    }
  }, [])

  const handleSearch = async () => {
    const category = customCategory.trim() || selectedCategory
    if (!selectedCat) { setError('Please select a cat first.'); return }
    if (!category)    { setError('Please choose or type a product category.'); return }

    setError('')
    setLoading(true)
    setSearched(true)
    setProducts([])

    try {
      const { data } = await api.post('/products/recommend', {
        catId: selectedCat,
        category,
        country,
      })
      setProducts(data.products || [])
      setCatName(data.cat?.name || '')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const activeCat = cats.find(c => c._id === selectedCat)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-10"
    >
      {/* ── Hero ── */}
      <div className="card overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, var(--accent-1) 0%, #e06b4a 100%)',
            opacity: 0.92,
          }} />
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext y='40' font-size='28'%3E🐾%3C/text%3E%3C/svg%3E\")",
            backgroundSize: '70px 70px',
          }} />
        <div className="relative z-10 p-6">
          <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-1">Smart Shopping</p>
          <h1 className="font-display text-3xl text-white mb-1">Product Recommendations</h1>
          <p className="text-white/75 text-sm">
            Personalised product picks based on your cat's profile ... with links to buy locally.
          </p>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="card p-5 space-y-5">

        {/* Cat selector */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}>
            🐱 Select Cat
          </label>
          {catsLoading ? (
            <div className="h-10 rounded-2xl animate-pulse" style={{ background: 'var(--border)' }} />
          ) : cats.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No cats found. Add a cat profile first to get personalised recommendations.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {cats.map(cat => (
                <motion.button
                  key={cat._id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCat(cat._id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all border"
                  style={{
                    background: selectedCat === cat._id ? 'var(--accent-1)' : 'var(--bg-card)',
                    color:      selectedCat === cat._id ? 'white' : 'var(--text-primary)',
                    borderColor: selectedCat === cat._id ? 'var(--accent-1)' : 'var(--border)',
                    boxShadow:  selectedCat === cat._id ? '0 4px 12px var(--accent-glow)' : 'none',
                  }}
                >
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white"
                    style={{ background: cat.color || 'var(--accent-1)' }}>
                    {cat.name[0].toUpperCase()}
                  </span>
                  {cat.name}
                  {cat.breed && <span className="text-xs opacity-70">· {cat.breed}</span>}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Cat profile preview */}
        <AnimatePresence>
          {activeCat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 p-3 rounded-2xl"
                style={{ background: 'var(--accent-soft)', border: '1px solid var(--border)' }}>
                {[
                  activeCat.age   && `🎂 ${activeCat.age}`,
                  activeCat.breed && `🐈 ${activeCat.breed}`,
                  activeCat.weight && `⚖️ ${activeCat.weight}kg`,
                  activeCat.healthConditions?.trim() && `💊 ${activeCat.healthConditions}`,
                  activeCat.allergies?.trim() && `⚠️ Allergies: ${activeCat.allergies}`,
                ].filter(Boolean).map((tag, i) => (
                  <span key={i} className="text-xs font-semibold px-2 py-1 rounded-lg"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category pills */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}>
            📦 Product Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => { setSelectedCategory(cat.id); setCustomCategory('') }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-bold transition-all border"
                style={{
                  background:  selectedCategory === cat.id && !customCategory ? 'var(--accent-1)' : 'var(--bg-card)',
                  color:       selectedCategory === cat.id && !customCategory ? 'white' : 'var(--text-primary)',
                  borderColor: selectedCategory === cat.id && !customCategory ? 'var(--accent-1)' : 'var(--border)',
                }}
              >
                {cat.icon} {cat.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom category input */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}>
            ✏️ Or Type a Custom Category
          </label>
          <input
            type="text"
            value={customCategory}
            onChange={e => { setCustomCategory(e.target.value); if (e.target.value) setSelectedCategory('') }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. litter boxes, carriers, dental care..."
            className="input w-full text-sm py-2.5 px-4"
            style={{ borderRadius: '0.875rem' }}
          />
        </div>

        {/* Country selector */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}>
            🌍 Your Location (for local retailers)
          </label>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map(c => (
              <motion.button
                key={c.code}
                whileTap={{ scale: 0.93 }}
                onClick={() => setCountry(c.code)}
                className="px-3 py-1.5 rounded-2xl text-xs font-bold transition-all border"
                style={{
                  background:  country === c.code ? 'var(--accent-1)' : 'var(--bg-card)',
                  color:       country === c.code ? 'white' : 'var(--text-primary)',
                  borderColor: country === c.code ? 'var(--accent-1)' : 'var(--border)',
                }}
              >
                {c.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40"
            >
              <span>⚠️</span>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSearch}
          disabled={loading || catsLoading || cats.length === 0}
          className="w-full py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: 'var(--accent-1)',
            color: 'white',
            boxShadow: '0 4px 16px var(--accent-glow)',
          }}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Finding recommendations...
            </>
          ) : (
            '✨ Get Recommendations'
          )}
        </motion.button>
      </div>

      {/* ── Results ── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <ProductSkeleton key={i} />)}
        </div>
      )}

      {!loading && searched && products.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-10 text-center space-y-3"
        >
          <p className="text-4xl">🔍</p>
          <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>No results found</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Try a different category or check your connection.
          </p>
        </motion.div>
      )}

      {!loading && products.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
              {products.length} recommendations for <span style={{ color: 'var(--accent-1)' }}>{catName}</span>
            </p>
            <span className="text-xs px-2 py-1 rounded-full font-bold"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent-1)' }}>
              {COUNTRIES.find(c => c.code === country)?.label}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product, i) => (
              <ProductCard key={i} product={product} index={i} />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
