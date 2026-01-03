/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mr-dark': '#1a1a2e',
        'mr-darker': '#16162a',
        'mr-accent': '#e94560',
        'mr-secondary': '#0f3460',
        'mr-light': '#eaeaea',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
