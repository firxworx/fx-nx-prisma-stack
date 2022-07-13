// const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')

module.exports = {
  theme: {
    extend: {},
  },
  plugins: [
    // common tailwindcss plugins
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),

    // custom inline plugin implementation with custom styles
    plugin(function ({ addBase }) {
      addBase({
        // always show the scrollbar on Windows to avoid horizontal jank during loading + transitions
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
      })
    }),
  ],
}
