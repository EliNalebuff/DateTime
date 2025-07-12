/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7f7',
          100: '#feeaea',
          200: '#fcd9da',
          300: '#f8bcc0',
          400: '#f39099',
          500: '#e86875',
          600: '#d54857',
          700: '#b33748',
          800: '#962f41',
          900: '#7f2b3d',
        },
        secondary: {
          50: '#f7f7fb',
          100: '#eeeef6',
          200: '#d9daea',
          300: '#b9bdd7',
          400: '#9399c0',
          500: '#7479aa',
          600: '#5f6396',
          700: '#4f5179',
          800: '#444565',
          900: '#3b3c54',
        },
        accent: {
          50: '#faf8ff',
          100: '#f4f0ff',
          200: '#ebe4ff',
          300: '#d9ccff',
          400: '#c4a9ff',
          500: '#ac82ff',
          600: '#9654ff',
          700: '#8438ff',
          800: '#7528d8',
          900: '#6121b3',
        },
        cream: {
          50: '#fefcf8',
          100: '#fdf9f0',
          200: '#faf0dd',
          300: '#f6e4c1',
          400: '#f1d49b',
          500: '#ebc074',
          600: '#e2a955',
          700: '#d18e40',
          800: '#ab7336',
          900: '#8a5e30',
        },
        navy: {
          50: '#f4f6fa',
          100: '#e6ebf4',
          200: '#d2dbe9',
          300: '#b2c3d9',
          400: '#8ca3c5',
          500: '#6f85b5',
          600: '#5a6ca6',
          700: '#4f5c97',
          800: '#454e7c',
          900: '#1a1f3a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 