const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')
// const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      colors: {
        button: {
          primary: colors.sky[700],
        },
        error: {
          DEFAULT: '#cb4848',
          50: '#fdf3f3',
          100: '#fbe5e5',
          200: '#f8d0d0',
          300: '#f2afaf',
          400: '#e98080',
          500: '#db5858',
          600: '#cb4848',
          700: '#a72e2e',
          800: '#8b2929',
          900: '#742828',
        },
      },
    },
  },
  plugins: [
    // common tailwindcss plugins
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),

    // add custom styles via inline custom plugin
    plugin(function ({ addBase, addComponents }) {
      const webkitSearchInputXIconTarget =
        'input[type="search"]::-webkit-search-decoration, input[type="search"]::-webkit-search-cancel-button, input[type="search"]::-webkit-search-results-button, input[type="search"]::-webkit-search-results-decoration'

      const ieSearchInputXIconTarget =
        'input.hide-clear[type=search]::-ms-clear, input.hide-clear[type=search]::-ms-reveal'

      addBase({
        // always show scrollbar to avoid horizontal jank on Windows PC's during loading + modals + transitions
        body: {
          overflowY: 'scroll',
        },
        // remove spinner on number inputs for chrome/safari/edge/opera
        'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
          '-webkit-appearance': 'none',
          margin: '0',
        },
        // remove spinner on number inputs for firefox
        'input[type="number"]': {
          '-moz-appearance': 'textfield',
        },
        // remove 'x' cancel icon from input type=search on webkit-based browsers
        [webkitSearchInputXIconTarget]: {
          '-webkit-appearance': 'none',
        },
        // remove 'x' cancel icon from input type=search on IE
        [ieSearchInputXIconTarget]: {
          display: 'none',
          width: 0,
          height: 0,
        },
      })
      addComponents({
        '.fx-box': {
          'p-4 sm:p-6 lg:p-8': {},
        },
        '.fx-button': {
          '@apply inline-flex items-center justify-center px-4 py-2 rounded-md': {},
        },
      })
    }),
  ],
}
