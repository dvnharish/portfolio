import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        /**
         * Height-aware gate for pinned chapter layouts. A role card is ~700px
         * tall; pinning it inside a shorter viewport would push part of it
         * permanently out of reach, so short viewports fall back to normal flow.
         */
        tall: { raw: '(min-height: 800px)' },
      },
      colors: {
        // Semantic tokens — see app/globals.css for the values per theme.
        paper: 'rgb(var(--paper) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
          subtle: 'rgb(var(--ink-subtle) / <alpha-value>)',
        },
        line: 'rgb(var(--line) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '72rem',
      },
      boxShadow: {
        // Light themes need elevation from shadow; dark themes from borders.
        lift: '0 1px 2px rgb(var(--shadow) / 0.04), 0 12px 32px -12px rgb(var(--shadow) / 0.10)',
        'lift-hover':
          '0 2px 4px rgb(var(--shadow) / 0.05), 0 24px 56px -16px rgb(var(--shadow) / 0.16)',
      },
      transitionTimingFunction: {
        weightless: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        // -50% because the ticker renders its list twice.
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 42s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
