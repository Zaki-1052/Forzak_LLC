/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{html,js,md}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#003366',
        secondary: '#0055A5',
        'neutral-100': '#F5F7FA',
        'neutral-800': '#1F2937',
        'accent-gold': '#C9A54B',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 