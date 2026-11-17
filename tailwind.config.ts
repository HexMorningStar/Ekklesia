import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        worship: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d0dce8',
          300: '#a7bfd5',
          400: '#769cbd',
          500: '#537da4',
          600: '#406387',
          700: '#34506e',
          800: '#2d435b',
          900: '#1e2c3d',
          950: '#0e1620',
        },
        sacred: {
          amber: '#d97706',
          gold: '#eab308',
          royal: '#3b82f6',
          wine: '#881337',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
} satisfies Config;
