/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // University of Johannesburg official brand (uj.ac.za / brand guidelines)
        brand: {
          orange: '#F26522',
          white: '#FFFFFF',
          black: '#000000',
          surface: '#F5F5F5',
          muted: '#F0F1F3',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        header: '0 1px 0 rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        sidebar: '4px 0 24px -8px rgba(0,0,0,0.08)',
      },
      maxWidth: {
        content: '80rem',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
