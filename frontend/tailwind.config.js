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
        crimson: {
          50: '#FDF1F3',
          100: '#FBE4E8',
          200: '#F5CBD1',
          300: '#EAA2AD',
          400: '#DD6878',
          500: '#C8102E', // Brand Primary
          600: '#A60D26', // Hover
          700: '#8A0B20', // Deep Crimson accent
          800: '#6E0819',
          900: '#4D0511',
          950: '#2E0209',
        },
        ink: {
          950: '#14090B', // Near-black text
          800: '#2A1C1F',
          700: '#433437',
          600: '#5F5254', // Secondary text
          500: '#7F7174', // Muted text
          400: '#A5979A',
          300: '#CCC1C3',
          200: '#E6DEE0',
          100: '#F3EEF0',
          50: '#FAF7F8',
        },
        surface: {
          light: '#FFFFFF',
          warm: '#FAF7F7',
          frosted: 'rgba(255, 255, 255, 0.72)',
          dark: '#0F0A0B',
          'dark-card': '#181013',
          'dark-frosted': 'rgba(24, 16, 19, 0.75)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(138, 11, 32, 0.05), 0 2px 8px 0 rgba(0, 0, 0, 0.02)',
        'glass-hover': '0 14px 40px 0 rgba(138, 11, 32, 0.08), 0 4px 12px 0 rgba(0, 0, 0, 0.03)',
        'crimson-sm': '0 2px 10px 0 rgba(200, 16, 46, 0.18)',
        'crimson-md': '0 8px 24px 0 rgba(200, 16, 46, 0.25)',
        'crimson-lg': '0 14px 34px -4px rgba(200, 16, 46, 0.32)',
        'card-soft': '0 4px 20px -2px rgba(20, 9, 11, 0.04), 0 2px 6px -1px rgba(20, 9, 11, 0.02)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
