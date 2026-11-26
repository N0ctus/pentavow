/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        elem: {
          fire: '#ef4444',
          water: '#3b82f6',
          wind: '#10b981',
          light: '#f59e0b',
          dark: '#8b5cf6',
        }
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(245, 158, 11, 0.8), 0 0 30px rgba(245, 158, 11, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(245, 158, 11, 1), 0 0 45px rgba(245, 158, 11, 0.7)' },
        },
        slash: {
          '0%': { transform: 'scale(0.4) rotate(-30deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(15deg)', opacity: '1' },
          '100%': { transform: 'scale(1.4) rotate(45deg)', opacity: '0' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0' },
          '20%': { transform: 'translateY(-10px) scale(1.1)', opacity: '1' },
          '80%': { transform: 'translateY(-35px) scale(1)', opacity: '0.9' },
          '100%': { transform: 'translateY(-50px) scale(0.9)', opacity: '0' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 1.5s infinite',
        'slash-fx': 'slash 0.35s ease-out forwards',
        'float-up': 'floatUp 1s ease-out forwards',
      }
    },
  },
  plugins: [],
}
