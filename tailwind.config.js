/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#001529',
        panels: '#002447',
        elevated: '#003366',
        accent: {
          red: '#E11D48',
          'red-hover': '#BE185D',
          'red-focus': '#9F1239',
        },
        muted: '#9CA3AF',
        text: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 150ms ease-out',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-elevated': '0 12px 40px rgba(0, 0, 0, 0.4)',
        'neon': '0 0 20px rgba(225, 29, 72, 0.3), 0 0 40px rgba(225, 29, 72, 0.1)',
        'neon-hover': '0 0 25px rgba(225, 29, 72, 0.4), 0 0 50px rgba(225, 29, 72, 0.2)',
      },
    },
  },
  plugins: [],
};