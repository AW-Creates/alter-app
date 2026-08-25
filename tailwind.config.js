/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Persona accents — used as accents/glows, not fill colors. Kept
        // slightly desaturated for a premium feel rather than neon.
        advisor: '#5eb8f5',   // Sky blue
        librarian: '#2dd4bf', // Teal (was too close to advisor's blue before)
        tutor: '#5fdb9e',     // Emerald / mint
        editor: '#eab054',    // Amber / gold
        roommate: '#ee7fb8',  // Rose / pink
        // Elevation scale — layered surfaces instead of one flat panel color
        surface: {
          void: '#04050a',
          1: '#0a0d16',
          2: '#0e131f',
          3: '#131a29',
        },
        hairline: 'rgba(255,255,255,0.07)',
        'hairline-strong': 'rgba(255,255,255,0.13)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.4), 0 12px 32px -12px rgba(0,0,0,0.55)',
        lift: '0 1px 1px rgba(0,0,0,0.5), 0 24px 48px -20px rgba(0,0,0,0.65)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
