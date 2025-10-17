/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        danger: '#f44336',
        info: '#2196F3',
        warning: '#FFC107',
      }
    },
  },
  plugins: [],
}