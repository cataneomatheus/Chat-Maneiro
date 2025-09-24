import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f5ff',
          100: '#e6ebff',
          200: '#c4cffc',
          300: '#9fb1f8',
          400: '#6f85f2',
          500: '#4259ec',
          600: '#3447bf',
          700: '#283694',
          800: '#1b2468',
          900: '#0f133d'
        }
      }
    }
  },
  plugins: []
}

export default config
