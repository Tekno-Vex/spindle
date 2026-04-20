import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['var(--font-playfair)'],
        mono: ['var(--font-mono)'],
        inter: ['var(--font-inter)'],
      },
      colors: {
        bg: '#0a0a0f',
        'bg-card': '#111118',
        'bg-elevated': '#1a1a24',
        border: '#2a2a3a',
        'border-bright': '#3a3a4f',
        text: '#e8e6f0',
        'text-muted': '#6b6880',
        'text-dim': '#9896a8',
        accent: '#c084fc',
        'accent-2': '#f472b6',
        'accent-3': '#38bdf8',
        gold: '#fbbf24',
      },
    },
  },
  plugins: [],
};

export default config;