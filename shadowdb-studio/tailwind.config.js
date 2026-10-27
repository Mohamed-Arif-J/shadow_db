/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          app: 'var(--bg-app)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-surface-elevated)',
          input: 'var(--bg-input)',
          border: 'var(--border-theme)',
          'border-subtle': 'var(--border-theme-subtle)',
          'border-muted': 'var(--border-theme-muted)',
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          accent: 'var(--color-accent)',
          'accent-hover': 'var(--color-accent-hover)',
          'accent-subtle': 'var(--color-accent-subtle)',
          'accent-border': 'var(--color-accent-border)',
        }
      }
    },
  },
  plugins: [],
}