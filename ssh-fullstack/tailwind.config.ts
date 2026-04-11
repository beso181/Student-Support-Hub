import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0B1F3A', light: '#112d52', lighter: '#17395f', dark: '#071428' },
        gold: { DEFAULT: '#c9a84c', dark: '#b0903a', light: '#faf6eb', lighter: '#fdfcf7' },
        slate: { 450: '#4a5a6b' },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
