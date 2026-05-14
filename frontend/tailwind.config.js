/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'charcoal-950': '#121212',
        'charcoal-900': '#1E1E1E',
        'charcoal-800': '#2A2A2A',
        'emerald-neon': '#10b981',
        'emerald-glow': '#34d399',
        'indigo-neon': '#6366f1',
        'indigo-glow': '#818cf8',
        'neon-crystal': '#39FF14',
        'neon-blue': '#2563EB',
        'hero-bg': 'hsl(0 0% 8%)',
        'nav-button': 'hsl(0 0% 18%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
