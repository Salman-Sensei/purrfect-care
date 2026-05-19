import { useEffect, useRef, useState, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Float, Stars, OrbitControls } from '@react-three/drei'
import { motion, useInView as useFramerInView, useScroll, useTransform } from 'framer-motion'
import * as THREE from 'three'

// ─── Real cat images from Unsplash (free, no key needed) ───────────────────
const IMGS = {
  hero:       'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1400&q=90&auto=format&fit=crop',
  heroAlt:    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=1400&q=90&auto=format&fit=crop',
  dental:     'https://images.unsplash.com/photo-1606425271394-c3ca9aa1fc06?w=600&q=85&auto=format&fit=crop',
  vet:        'https://images.unsplash.com/photo-1721907043479-943b8b571ca9?w=600&q=85&auto=format&fit=crop',
  litter:     'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=600&q=85&auto=format&fit=crop',
  feeding:    'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=600&q=85&auto=format&fit=crop',
  happy:      'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600&q=85&auto=format&fit=crop',
  sleeping:   'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=85&auto=format&fit=crop',
  playing:    'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600&q=85&auto=format&fit=crop',
  checklist:  'https://images.unsplash.com/photo-1570824104453-508955ab713e?w=600&q=85&auto=format&fit=crop',
  portrait:   'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=500&q=85&auto=format&fit=crop',
}

// ─── Scroll-reveal hook (legacy, used by non-motion sections) ──────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

// ─── Framer Motion Reveal wrapper ─────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const isInView = useFramerInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

// ─── 3D Glowing Orb with MeshDistortMaterial ──────────────────────────────
function GlowOrb({ mouse }) {
  const meshRef = useRef()
  const innerRef = useRef()

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()
    // Smooth mouse tilt
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x, mouse.current.y * 0.4, 0.05
    )
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y, mouse.current.x * 0.4, 0.05
    )
    // Inner pulse
    if (innerRef.current) {
      innerRef.current.rotation.y = t * 0.3
      innerRef.current.rotation.z = t * 0.15
    }
  })

  return (
    <group ref={meshRef}>
      {/* Main distort sphere */}
      <mesh castShadow>
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshDistortMaterial
          color="#7c3aed"
          emissive="#4c1d95"
          emissiveIntensity={0.6}
          distort={0.45}
          speed={2.5}
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Inner bright core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <MeshDistortMaterial
          color="#a78bfa"
          emissive="#7c3aed"
          emissiveIntensity={1.2}
          distort={0.6}
          speed={4}
          roughness={0}
          metalness={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.04, 16, 100]} />
        <meshStandardMaterial
          color="#c4b5fd"
          emissive="#7c3aed"
          emissiveIntensity={2}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Second ring, tilted */}
      <mesh rotation={[Math.PI / 4, Math.PI / 6, 0]}>
        <torusGeometry args={[2.3, 0.025, 16, 100]} />
        <meshStandardMaterial
          color="#818cf8"
          emissive="#4f46e5"
          emissiveIntensity={1.5}
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  )
}

// ─── Orbiting particles ───────────────────────────────────────────────────
function OrbitParticles() {
  const groupRef = useRef()
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * 0.2
  })
  const pts = Array.from({ length: 80 }, (_, i) => {
    const angle = (i / 80) * Math.PI * 2
    const r = 2.8 + Math.sin(i * 2.3) * 0.4
    return [Math.cos(angle) * r, (Math.random() - 0.5) * 1.5, Math.sin(angle) * r]
  })
  return (
    <group ref={groupRef}>
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial color="#c4b5fd" emissive="#7c3aed" emissiveIntensity={3} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Hero 3D Scene ────────────────────────────────────────────────────────
function HeroScene({ mouse }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#a78bfa" />
      <pointLight position={[-5, -3, -2]} intensity={1.5} color="#818cf8" />
      <pointLight position={[0, 0, 3]} intensity={1} color="#ffffff" />
      <Stars radius={60} depth={50} count={800} factor={3} fade speed={0.5} />
      <Suspense fallback={null}>
        <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.6}>
          <GlowOrb mouse={mouse} />
        </Float>
        <OrbitParticles />
      </Suspense>
    </Canvas>
  )
}

// ─── Floating nav ──────────────────────────────────────────────────────────
function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
      ${scrolled
        ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-soft border-b border-slate-100 dark:border-slate-800 py-3'
        : 'bg-transparent py-5'
      }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 select-none group">
          <div className={`relative grid place-items-center rounded-2xl p-2.5 transition-all duration-500
            ${scrolled
              ? 'bg-white/80 backdrop-blur-md ring-1 ring-slate-200 shadow-lg shadow-slate-200/40'
              : 'bg-white/20 backdrop-blur-md ring-1 ring-white/30 shadow-lg shadow-black/10'
            }`}>
            <svg viewBox="0 0 40 40"
              className={`w-8 h-8 transition-all duration-500 group-hover:scale-110
                ${scrolled ? 'text-slate-800 dark:text-slate-900' : 'text-white'}`}
              fill="currentColor">
              <path d="M10 18 L6 8 L14 13 Z" />
              <path d="M30 18 L34 8 L26 13 Z" />
              <circle cx="20" cy="20" r="9" />
              <ellipse cx="20" cy="31" rx="7" ry="6" />
              <path d="M27 33 Q36 30 35 24 Q34 20 31 21" strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round" />
              <circle cx="17" cy="19" r="1.2" fill="white" />
              <circle cx="23" cy="19" r="1.2" fill="white" />
            </svg>
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 bg-gradient-to-tr from-pink-200 via-white to-purple-200 group-hover:opacity-60 transition-all duration-500" />
          </div>
          <span className={`font-display text-xl md:text-2xl tracking-tight font-semibold transition-all duration-500
            ${scrolled ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
            Purrfect{' '}
            <span className={`transition-all duration-500 ${scrolled ? 'text-slate-400 dark:text-slate-500' : 'text-white/60'}`}>
              Care
            </span>
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {[['#features','Features'],['#education','Cat Care'],['#how','How It Works']].map(([h,l]) => (
            <a key={h} href={h}
              className={`text-sm font-semibold transition-colors hover:text-brand-400
                ${scrolled ? 'text-slate-600 dark:text-slate-300' : 'text-white/80'}`}>
              {l}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link to="/login"
            className={`text-sm font-bold px-4 py-2 rounded-xl transition-all
              ${scrolled
                ? 'text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30'
                : 'text-white/90 hover:text-white'
              }`}>
            Sign In
          </Link>
          <Link to="/login"
            className="text-sm font-bold px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700
                       text-white shadow-soft hover:shadow-card transition-all active:scale-95">
            Get Started Free
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── Hero Section ... Split Layout with 3D orb ──────────────────────────────
function HeroSection() {
  const mouse = useRef({ x: 0, y: 0 })
  const sectionRef = useRef(null)

  const handleMouseMove = (e) => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return
    mouse.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    mouse.current.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2
  }

  const handleMouseLeave = () => {
    mouse.current = { x: 0, y: 0 }
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #020617 0%, #0f0a2e 40%, #1e1b4b 70%, #0a0a1a 100%)' }}
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute top-[30%] left-[30%] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)', filter: 'blur(40px)' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
      </div>

      {/* Content: left text + right 3D */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-0">

          {/* ── LEFT: Text ── */}
          <div className="flex-1 lg:pr-8 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/8 backdrop-blur border border-white/15
                         text-white/85 text-xs font-bold px-4 py-2 rounded-full mb-8 shadow-lg"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Trusted by 10,000+ cat parents worldwide
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-6"
            >
              Purrfect Care<br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                for Your Cat
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="text-white/65 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed mb-10"
            >
              Track daily care, vet visits, and health in one beautiful app.
              Your cat deserves nothing less than the best ... and so do you.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <Link to="/login"
                className="group inline-flex items-center gap-2 text-white font-bold text-base px-8 py-4 rounded-2xl
                           transition-all duration-300 active:scale-95 shadow-lg hover:shadow-purple-500/30"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                Get Started Free
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <a href="#features"
                className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 backdrop-blur
                           text-white font-bold text-base px-8 py-4 rounded-2xl border border-white/20
                           hover:border-white/35 transition-all duration-300 active:scale-95">
                See How It Works ↓
              </a>
            </motion.div>

            {/* Value prop cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto lg:mx-0"
            >
              {[
                { icon: '✓', title: 'Daily Checklist', desc: 'Never miss feeding or meds' },
                { icon: '♥', title: 'Vet Records Hub', desc: 'All health records in one place' },
                { icon: '✦', title: 'Symptom Helper', desc: 'Know when to call the vet' },
              ].map(({ icon, title, desc }) => (
                <div key={title}
                  className="bg-white/6 backdrop-blur border border-white/12 rounded-2xl p-4
                             hover:bg-white/10 transition-all duration-200 text-left group">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/25 flex items-center
                                  justify-center text-purple-300 text-sm mb-2.5 font-bold">
                    {icon}
                  </div>
                  <p className="text-white font-bold text-sm mb-0.5">{title}</p>
                  <p className="text-white/45 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: 3D Canvas ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 w-full"
            style={{ height: 520, minWidth: 0 }}
          >
            {/* Glow behind canvas */}
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 rounded-full opacity-30"
                  style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(40px)' }} />
              </div>
              <HeroScene mouse={mouse} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <p className="text-white/35 text-xs font-semibold tracking-widest uppercase">Scroll to explore</p>
        <div className="w-5 h-8 rounded-full border-2 border-white/25 flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
        </div>
      </motion.div>
    </section>
  )
}

// ─── Stats bar ─────────────────────────────────────────────────────────────
function StatsBar() {
  const [ref, visible] = useInView()
  const stats = [
    { n: '10,000+', l: 'Happy Cat Parents' },
    { n: '98%',     l: 'Would Recommend'   },
    { n: '50,000+', l: 'Tasks Tracked'     },
    { n: '24/7',    l: 'Always Available'  },
  ]
  return (
    <div ref={ref} className="bg-brand-600 dark:bg-brand-800 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ n, l }, i) => (
            <div key={l}
              style={{
                opacity:    visible ? 1 : 0,
                transform:  visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`,
              }}>
              <p className="font-display text-4xl md:text-5xl text-white font-bold">{n}</p>
              <p className="text-brand-200 text-sm font-semibold mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Daily Care Checklist',
      desc: 'Build healthy routines with a smart daily checklist. Track feeding, medication, play time, and litter box cleaning ... all in one tap.',
      img: IMGS.checklist,
      color: 'from-brand-500 to-brand-700',
      badge: 'Most Used',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
      title: 'Vet Records Hub',
      desc: "Keep every vaccination, checkup, and dental visit organized. Never scramble for health records at the vet's office again.",
      img: IMGS.vet,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Health',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      ),
      title: 'Symptom Checker',
      desc: 'Not sure if that sneeze is serious? Our symptom guide gives you instant, vet-informed advice on common cat health concerns.',
      img: IMGS.happy,
      color: 'from-coral-500 to-orange-600',
      badge: 'Trusted',
    },
  ]

  return (
    <section id="features" className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Everything You Need</span>
          <h2 className="font-display text-4xl md:text-5xl text-slate-900 dark:text-white mt-3 mb-4">
            Care made <em className="not-italic text-brand-600">simple</em>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Three powerful tools, one beautiful app. Your cat will thank you.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon, title, desc, img, color, badge }, i) => (
            <Reveal key={title} delay={i * 0.15}
              className="group relative rounded-3xl overflow-hidden shadow-card hover:shadow-hover
                         transition-all duration-400 hover:-translate-y-2 bg-white dark:bg-slate-900
                         border border-slate-100 dark:border-slate-800 cursor-pointer">
              <div className="relative h-52 overflow-hidden">
                <img src={img} alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className={`absolute inset-0 bg-gradient-to-t ${color} opacity-60 group-hover:opacity-70 transition-opacity`} />
                <div className="absolute top-4 right-4">
                  <span className="text-xs font-black bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full border border-white/30">
                    {badge}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 text-3xl text-white">{icon}</div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
                <Link to="/login"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-brand-600 dark:text-brand-400
                             hover:gap-2.5 transition-all group/link">
                  Try it free
                  <span className="transition-transform group-hover/link:translate-x-1">→</span>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Educational content ───────────────────────────────────────────────────
function EducationSection() {
  const articles = [
    {
      img:   IMGS.dental,
      tag:   'Dental Health',
      title: 'Dental Care for Your Cat',
      body:  'Dental disease is one of the most common problems vets see. By age 3, most cats show signs of dental issues. Regular brushing and annual checkups can add years to your cat\'s life.',
      cta:   'Track dental visits →',
      to:    '/login',
    },
    {
      img:   IMGS.vet,
      tag:   'Vet Visits',
      title: 'Stress-Free Vet Trips',
      body:  'Carrier training and familiar scents can dramatically reduce your cat\'s anxiety. Use Purrfect Care to track visits, prepare questions, and remember what the vet said.',
      cta:   'Log a vet record →',
      to:    '/login',
    },
    {
      img:   IMGS.litter,
      tag:   'Behaviour',
      title: 'Litter Box Problems?',
      body:  "Peeing outside the box is the #1 reason cats are surrendered to shelters ... but it's almost always fixable. Our Symptom Helper guides you through common causes and solutions.",
      cta:   'Use symptom helper →',
      to:    '/login',
    },
    {
      img:   IMGS.feeding,
      tag:   'Nutrition',
      title: 'Feeding Your Cat Right',
      body:  'Cats are obligate carnivores and need animal protein at every meal. Track feeding times, weights, and dietary notes to keep your cat at a healthy weight.',
      cta:   'Start tracking →',
      to:    '/login',
    },
  ]

  return (
    <section id="education" className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center mb-6">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Cat Care Tips</span>
          <h2 className="font-display text-4xl md:text-5xl text-slate-900 dark:text-white mt-3 mb-4">
            Cat Care Made <em className="not-italic text-brand-600">Simple</em>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
            Vet-informed advice, written for real cat parents ... not textbooks.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-wrap justify-center gap-4 mb-14">
          {[
            { icon: '🩺', label: 'Vet-informed content' },
            { icon: '🏆', label: 'Trusted by 10k+ parents' },
            { icon: '💚', label: 'Cat welfare focused'    },
          ].map(({ icon, label }) => (
            <div key={label}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200
                         dark:border-slate-700 px-4 py-2 rounded-full shadow-soft">
              <span>{icon}</span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</span>
            </div>
          ))}
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map(({ img, tag, title, body, cta, to }, i) => (
            <Reveal key={title} delay={i * 0.12}
              className="group flex flex-col md:flex-row gap-0 rounded-3xl overflow-hidden
                         bg-white dark:bg-slate-800 shadow-card hover:shadow-hover
                         border border-slate-100 dark:border-slate-700
                         transition-all duration-400 hover:-translate-y-1">
              <div className="relative md:w-48 h-52 md:h-auto flex-shrink-0 overflow-hidden">
                <img src={img} alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:bg-gradient-to-r" />
                <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider
                                 bg-brand-600 text-white px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              </div>
              <div className="flex flex-col justify-center p-6">
                <h3 className="font-display text-xl text-slate-900 dark:text-white mb-2 leading-snug">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">{body}</p>
                <Link to={to}
                  className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 dark:text-brand-400
                             hover:gap-2 transition-all group/link self-start">
                  {cta}
                  <span className="transition-transform group-hover/link:translate-x-1">→</span>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How it works ──────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { n: '01', title: 'Add Your Cat', desc: 'Create a profile in under a minute.', img: IMGS.portrait },
    { n: '02', title: 'Track Daily Care', desc: 'Tick off tasks and watch the Purr Level rise.', img: IMGS.playing },
    { n: '03', title: 'Stay on Top of Health', desc: 'Log every vet visit and never miss one.', img: IMGS.vet },
  ]

  return (
    <section id="how" className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Getting Started</span>
          <h2 className="font-display text-4xl md:text-5xl text-slate-900 dark:text-white mt-3 mb-4">
            Up and running in{' '}
            <em className="not-italic text-brand-600">3 minutes</em>
          </h2>
        </Reveal>

        <div className="flex flex-col md:flex-row items-start justify-center gap-0">
          {steps.map(({ n, title, desc, img }, i) => (
            <div key={n} className="flex flex-col md:flex-row items-center flex-1">
              <Reveal delay={i * 0.3} className="flex flex-col items-center text-center w-full px-4">
                <div className="relative mb-5 group"
                  style={{ animation: `popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.3 + 0.2}s both` }}>
                  <div className="absolute -inset-2 rounded-3xl bg-brand-400/20 blur-xl group-hover:bg-brand-400/40 transition-all duration-500" />
                  <div className="relative w-40 h-40 rounded-3xl overflow-hidden shadow-luxury
                                  group-hover:scale-105 group-hover:shadow-hover transition-all duration-500">
                    <img src={img} alt={title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900/50 to-transparent" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-brand-600
                                  flex items-center justify-center text-white font-black text-sm
                                  shadow-glow border-2 border-white dark:border-slate-950
                                  group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    {n}
                  </div>
                </div>
                <h3 className="font-display text-lg text-slate-900 dark:text-white mb-1">{title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-[140px]">{desc}</p>
              </Reveal>
              {i < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center flex-shrink-0 w-16 mt-[-60px]">
                  <div className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full origin-left"
                    style={{ animation: `growLine 0.8s ease-out ${i * 0.3 + 0.55}s both` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        <Reveal delay={1.2} className="text-center mt-14">
          <Link to="/login"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-glow group active:scale-95 transition-all">
            Start Now ... It's Free
            <span className="group-hover:animate-wiggle transition-all text-xl">🐾</span>
          </Link>
          <p className="text-slate-400 text-xs mt-3">No credit card required. Always free.</p>
        </Reveal>
      </div>

      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.5) translateY(20px); }
          70%  { transform: scale(1.08) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes growLine {
          0%   { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }
      `}</style>
    </section>
  )
}

// ─── Testimonials ──────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Purrfect Care changed how I look after my two cats. The vet record tracker alone is worth it ... I used to lose all the papers!",
      name:  'Sarah K.',
      role:  'Cat mum of 2 · Lahore',
      avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80&auto=format&fit=crop&facepad=3',
      stars: 5,
    },
    {
      quote: "Simple, beautiful, and actually useful. I love the Symptom Helper ... it saved me an emergency vet trip last month!",
      name:  'Mike T.',
      role:  'First-time cat owner · Karachi',
      avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&auto=format&fit=crop&facepad=3',
      stars: 5,
    },
    {
      quote: "My vet was impressed that I had all of Luna's history on my phone. Purrfect Care makes me look like a great cat parent!",
      name:  'Aisha M.',
      role:  'Cat enthusiast · Islamabad',
      avatar:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80&auto=format&fit=crop&facepad=3',
      stars: 5,
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">What Cat Parents Say</span>
          <h2 className="font-display text-4xl md:text-5xl text-slate-900 dark:text-white mt-3">
            Loved by <em className="not-italic text-brand-600">cat families</em>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {testimonials.map(({ quote, name, role, avatar, stars }, i) => (
            <Reveal key={name} delay={i * 0.15}
              className="group relative bg-white dark:bg-slate-800 rounded-3xl p-7
                         shadow-card hover:shadow-hover border border-slate-100 dark:border-slate-700
                         transition-all duration-400 hover:-translate-y-1">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: stars }).map((_, j) => (
                  <span key={j} className="text-amber-400 text-base">★</span>
                ))}
              </div>
              <div className="font-display text-6xl text-brand-200 dark:text-brand-800 leading-none -mt-2 mb-1">"</div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 -mt-4">{quote}</p>
              <div className="flex items-center gap-3">
                <img src={avatar} alt={name} className="w-10 h-10 rounded-2xl object-cover shadow-soft" />
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{name}</p>
                  <p className="text-xs text-slate-400">{role}</p>
                </div>
              </div>
              <div className="absolute bottom-5 right-5 text-2xl opacity-10 group-hover:opacity-20 transition-opacity">🐾</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Big feature split ─────────────────────────────────────────────────────
function SplitShowcaseSection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16 mb-24">
          <Reveal delay={0} className="flex-1">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-luxury">
                <img src={IMGS.sleeping} alt="Cat resting peacefully" className="w-full h-80 object-cover" />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-white dark:bg-slate-800 rounded-2xl shadow-luxury p-4 flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xl">✅</div>
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-white">Today's tasks</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">3/4 complete · 75%</p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.2} className="flex-1 space-y-5">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Daily Checklist</span>
            <h2 className="font-display text-3xl md:text-4xl text-slate-900 dark:text-white leading-snug">
              Build healthy routines<br />your cat will <em className="not-italic text-brand-600">love</em>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              From morning feeding to evening play sessions ... Purrfect Care's daily checklist keeps your cat's routine consistent and you stress-free.
            </p>
            <ul className="space-y-2">
              {['Preset tasks (feeding, play, meds, litter)', 'Visual progress bar ... the Purr Level™', 'Filter by cat or date', 'Mobile-first, works on any device'].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2 text-sm">Start Tracking Free →</Link>
          </Reveal>
        </div>

        <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-16">
          <Reveal delay={0} className="flex-1">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-luxury">
                <img src={IMGS.vet} alt="Cat at vet" className="w-full h-80 object-cover" />
              </div>
              <div className="absolute -bottom-5 -left-5 bg-white dark:bg-slate-800 rounded-2xl shadow-luxury p-4 flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">💉</div>
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-white">Next vaccination</p>
                  <p className="text-xs text-coral-600 dark:text-coral-400 font-bold">In 3 days · FVRCP</p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.2} className="flex-1 space-y-5">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Vet Records</span>
            <h2 className="font-display text-3xl md:text-4xl text-slate-900 dark:text-white leading-snug">
              Every health record,<br /><em className="not-italic text-brand-600">always with you</em>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Log vaccinations, dental cleanings, emergency visits, and annual checkups. Set reminders for next appointments so nothing slips through the cracks.
            </p>
            <ul className="space-y-2">
              {['5 visit types with colour coding', 'Next visit date reminders', 'Vet name & clinic notes', 'Full health history timeline'].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2 text-sm">Track Vet Visits →</Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// ─── Newsletter + final CTA ────────────────────────────────────────────────
function CTASection() {
  const [email, setEmail]     = useState('')
  const [subbed, setSubbed]   = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.includes('@')) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setSubbed(true) }, 1000)
  }

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMGS.happy} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/92 via-brand-900/88 to-slate-950/95" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold
                          px-4 py-2 rounded-full border border-white/20 mb-6">
            📬 Weekly Cat Care Tips
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
            Get weekly cat-care tips<br />
            <em className="not-italic text-brand-300">delivered to your inbox</em>
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-lg mx-auto">
            Vet-informed advice, seasonal health reminders, and feature updates. Unsubscribe anytime.
          </p>

          {subbed
            ? <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-2xl px-8 py-5 inline-flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <p className="text-emerald-300 font-bold">You're subscribed! Check your inbox.</p>
              </div>
            : <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/20
                             text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-400
                             focus:border-transparent text-sm"
                />
                <button type="submit" disabled={loading}
                  className="px-6 py-3.5 rounded-2xl bg-white text-brand-700 font-bold text-sm
                             hover:bg-brand-50 active:scale-95 transition-all shadow-soft whitespace-nowrap">
                  {loading ? '...' : 'Subscribe 🐾'}
                </button>
              </form>
          }
        </Reveal>

        <Reveal>
          <div className="border-t border-white/10 my-12" />
        </Reveal>

        <Reveal delay={0.1} className="text-center">
          <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
            Ready to give your cat<br />
            <em className="not-italic text-brand-300">the care they deserve?</em>
          </h2>
          <p className="text-white/60 mb-10 max-w-md mx-auto">
            Join thousands of cat parents who track, care, and love smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login"
              className="group inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500
                         text-white font-bold text-base px-10 py-4 rounded-2xl shadow-glow
                         hover:shadow-hover transition-all duration-300 active:scale-95">
              Get Started Free ... It's Free
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link to="/login"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20
                         text-white font-bold text-base px-10 py-4 rounded-2xl border border-white/25
                         hover:border-white/40 transition-all active:scale-95">
              Sign In
            </Link>
          </div>
          <p className="text-white/30 text-xs mt-5">No credit card · No hidden fees · Always free</p>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────
function LandingFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 40 40" className="w-9 h-9 text-white" fill="currentColor">
              <path d="M10 18 L6 8 L14 13 Z" />
              <path d="M30 18 L34 8 L26 13 Z" />
              <circle cx="20" cy="20" r="9" />
              <ellipse cx="20" cy="31" rx="7" ry="6" />
              <path d="M27 33 Q36 30 35 24 Q34 20 31 21" strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round" />
              <circle cx="17" cy="19" r="1.2" fill="#0f172a" />
              <circle cx="23" cy="19" r="1.2" fill="#0f172a" />
            </svg>
            <span className="font-display text-lg text-white">
              Purrfect <span className="text-slate-500">Care</span>
            </span>
          </div>

          <p className="text-slate-600 text-sm text-center">
            Made with 💜 for cat parents everywhere. © {new Date().getFullYear()} Purrfect Care.
          </p>

          <div className="flex items-center gap-6">
            {[['#features','Features'],['#education','Tips'],['#how','How It Works']].map(([h, l]) => (
              <a key={h} href={h} className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors">
                {l}
              </a>
            ))}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 text-sm font-bold transition-colors">
              Sign In →
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-center gap-3 text-sm">
          <span className="text-slate-500">👨‍💻 Developed by</span>
          <strong className="text-slate-300">Salman Khan</strong>
          <span className="text-slate-700 hidden md:block">|</span>
          <a
            href="https://www.linkedin.com/in/salmankhan-developer/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-[#0A66C2] transition-all duration-300 font-medium group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span>Connect on LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  )
}

// ─── Main LandingPage ──────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="font-body bg-white dark:bg-slate-950 overflow-x-hidden">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        html { scroll-behavior: smooth; }
      `}</style>

      <LandingNav />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <SplitShowcaseSection />
      <EducationSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <LandingFooter />
    </div>
  )
}
