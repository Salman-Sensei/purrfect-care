/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff', 100: '#e0eaff', 200: '#c7d7fe', 300: '#a5b8fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
        },
        coral: {
          50: '#fff4f0', 100: '#ffe5dc', 200: '#ffc9b5', 300: '#ffa080',
          400: '#ff7150', 500: '#ff4d26', 600: '#f03010', 700: '#c8220c',
        },
        warm: {
          50: '#fdfaf6', 100: '#faf4eb', 200: '#f3e4cc', 300: '#e8cfa0',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':   'fadeIn 0.5s ease-out',
        'fade-up':   'fadeUp 0.6s ease-out',
        'slide-down':'slideDown 0.3s ease-out',
        'scale-in':  'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68,-0.55,0.27,1.55)',
        'float':     'float 3s ease-in-out infinite',
        'shimmer':   'shimmer 1.5s infinite',
        'wiggle':    'wiggle 0.5s ease-in-out',
        'stagger-1': 'fadeUp 0.6s ease-out 0.1s both',
        'stagger-2': 'fadeUp 0.6s ease-out 0.2s both',
        'stagger-3': 'fadeUp 0.6s ease-out 0.3s both',
        'stagger-4': 'fadeUp 0.6s ease-out 0.4s both',
        'stagger-5': 'fadeUp 0.6s ease-out 0.5s both',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp:    { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.8)' }, to: { opacity: '1', transform: 'scale(1)' } },
        bounceIn:  { from: { opacity: '0', transform: 'scale(0.3)' }, '50%': { transform: 'scale(1.05)' }, to: { opacity: '1', transform: 'scale(1)' } },
        float:     { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        wiggle:    { '0%,100%': { transform: 'rotate(0deg)' }, '25%': { transform: 'rotate(-12deg)' }, '75%': { transform: 'rotate(12deg)' } },
      },
      boxShadow: {
        'soft':  '0 2px 20px rgba(99,102,241,0.08)',
        'card':  '0 4px 30px rgba(99,102,241,0.10)',
        'hover': '0 16px 48px rgba(99,102,241,0.20)',
        'glow':  '0 0 40px rgba(99,102,241,0.35)',
        'luxury':'0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        'coral': '0 8px 24px rgba(255,77,38,0.25)',
        'image': '0 20px 60px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
