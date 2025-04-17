/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './templates/**/*.html',
    './static/src/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        'brand-color': '#4F46E5',
        'accent-color': '#06B6D4',
        'text-color': '#4b5563',
        'success-color': '#10B981',
        'warn-color': '#F59E0B',
      },
    },
  },
  plugins: [
    require('daisyui')
  ],
}
