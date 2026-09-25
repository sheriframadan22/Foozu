/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Baloo 2"', '"Tajawal"', 'system-ui', 'sans-serif'],
        body: ['"Tajawal"', 'system-ui', 'sans-serif']
      },
      colors: {
        // Sampled directly from the official Foozu brand artwork (logo + banner).
        foozu: {
          navy: '#28286E',
          navy2: '#1F1F58',
          purple: '#325996',
          pink: '#E31367',
          red: '#EF4F41',
          orange: '#EF4F41',
          teal: '#3BBC9C',
          yellow: '#F4B231',
          blue: '#325996',
          cyan: '#13B2D2',
          ink: '#181850'
        }
      },
      boxShadow: {
        card: '0 10px 30px -10px rgba(0,0,0,0.45)',
        glow: '0 0 0 4px rgba(255,79,139,0.35)'
      },
      borderRadius: {
        xl2: '1.75rem'
      },
      keyframes: {
        popIn: { '0%': { transform: 'scale(0.85)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(24px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 0 0 rgba(255,79,139,0.55)' }, '50%': { boxShadow: '0 0 0 14px rgba(255,79,139,0)' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } },
        flashRed: { '0%,100%': { color: '#fff' }, '50%': { color: '#FF6B6B' } },
        confettiFall: { '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: '1' }, '100%': { transform: 'translateY(110vh) rotate(360deg)', opacity: '0.9' } }
      },
      animation: {
        popIn: 'popIn 260ms cubic-bezier(0.2,0.8,0.2,1)',
        slideUp: 'slideUp 320ms cubic-bezier(0.2,0.8,0.2,1)',
        pulseGlow: 'pulseGlow 1.1s ease-out infinite',
        shake: 'shake 340ms ease-in-out',
        flashRed: 'flashRed 0.5s ease-in-out infinite',
        confettiFall: 'confettiFall linear forwards'
      }
    }
  },
  plugins: []
};
