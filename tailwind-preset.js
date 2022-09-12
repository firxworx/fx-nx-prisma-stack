const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')

const defaultTheme = require('tailwindcss/defaultTheme')

// const Color = require('color')
// const alpha = (c, val) => Color(c).alpha(val).rgb().string()
// const lighen = (c, val) => Color(c).lighten(val).rgb().string()
// const darken = (c, val) => Color(c).darken(val).rgb().string()

module.exports = {
  theme: {
    screens: {
      xs: '475px',
      ...defaultTheme.screens,
    },
    extend: {
      spacing: {
        1.25: '0.3125rem',
      },
      minWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },
      fontSize: {
        xxs: '.625rem',
      },
      opacity: {
        5: '0.05',
      },
      // add zIndex values from 60-100 in steps of 10
      zIndex: Array.from({ length: 5 }, (_, i) => (6 + i) * 10).reduce(
        (acc, curr) => ({ ...acc, [curr]: String(curr) }),
        {},
      ),
      colors: {
        // palette: {},
        button: {
          primary: colors.sky[700],
        },
        action: {
          primary: {
            lightest: colors.sky[500],
            lighter: colors.sky[600],
            DEFAULT: colors.sky[700],
            darker: colors.sky[800],
            darkest: colors.sky[900],
          },
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

      // these selectors match + override the selector used by the @tailwindcss/forms plugin
      const formInputTargets = `[type='text']:not(.fx-custom-input), [type='email'], [type='url'], [type='password'], [type='number'], [type='date'], [type='datetime-local'], [type='month'], [type='search'], [type='tel'], [type='time'], [type='week'], [multiple], textarea, select`
      // const formInputFocusTargets = `[type='text']:focus:not(.fx-custom-input), [type='email']:focus, [type='url']:focus, [type='password']:focus, [type='number']:focus, [type='date']:focus, [type='datetime-local']:focus, [type='month']:focus, [type='search']:focus, [type='tel']:focus, [type='time']:focus, [type='week']:focus, [multiple]:focus, textarea:focus, select:focus`
      // const buttonTargets = `button, [type='button'], [type='reset'], [type='submit']`

      addBase({
        // always show scrollbar to avoid horizontal jank on Windows PC's during loading + modals + transitions
        body: {
          overflowY: 'scroll',
        },
        main: {
          '@apply text-slate-900': {},
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
        [formInputTargets]: {
          '@apply border border-slate-300 rounded-md': {},
          '@apply focus:outline-none focus-visible:border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-100':
            {},
        },
        // [formInputFocusTargets]: {
        // }
      })
      addComponents({
        '.fx-layout-max-width': {
          '@apply max-w-6xl': {},
        },
        '.fx-layout-padding-x': {
          '@apply px-0 xs:px-4 sm:px-6 xl:px-8': {},
        },
        '.fx-layout-padding-y': {
          '@apply pt-0 xs:pt-4 sm:pt-6 pb-10 xs:pb-12 sm:pb-16': {},
        },
        '.fx-box': {
          'p-2 xs:p-4 sm:p-6 lg:p-8': {},
        },
        '.fx-button-base, button.fx-button-base, a.fx-button-base': {
          // px-2 py-1
          '@apply inline-flex items-center justify-center px-3 py-1.5 xs:px-4 xs:py-2 rounded-md': {},
          '@apply text-base font-medium tracking-tight fx-focus-ring transition-colors': {},
        },
        'button.fx-button-solid-primary, a.fx-button-solid-primary': {
          '@apply border-2 border-sky-800 bg-sky-800 text-white hover:bg-sky-900 hover:bg-sky-900': {},
        },
        'button.fx-button-solid-primary-disabled, a.fx-button-solid-primary-disabled': {
          '@apply border-2 border-slate-200 bg-slate-200 text-slate-400 cursor-not-allowed': {},
        },
        'button.fx-button-outline-primary, a.fx-button-outline-primary': {
          '@apply border-2 bg-transparent border-sky-800 text-sky-800 hover:bg-sky-100 hover:border-sky-900 hover:text-sky-900':
            {},
        },
        'button.fx-button-outline-primary-disabled, a.fx-button-outline-primary-disabled': {
          '@apply border-2 bg-transparent border-slate-300 text-slate-400 cursor-not-allowed': {},
        },
        'button.fx-button-transparent-primary, a.fx-button-transparent-primary': {
          '@apply border-2 bg-transparent border-transparent text-sky-800 hover:text-sky-900': {},
        },
        'button.fx-button-transparent-primary-disabled, a.fx-button-transparent-primary-disabled': {
          '@apply border-2 bg-transparent border-transparent text-slate-400 cursor-not-allowed': {},
        },
        '.fx-input-border, input.fx-input-border': {
          '@apply border border-slate-300 rounded-md': {},
        },
        '.fx-focus-ring': {
          '@apply focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200': {},
        },
        '.fx-focus-ring-form': {
          '@apply focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-sky-100': {},
        },
        '.fx-link': {
          '@apply font-medium text-action-primary-darker fx-focus-ring focus:rounded-sm transition-colors duration-150':
            {},
          '&:hover': {
            '@apply text-action-primary underline': {},
          },
          '&:active': {
            '@apply text-action-primary': {},
          },
        },
        '.fx-form-label': {
          '@apply block text-sm font-normal text-slate-700': {},
        },
      })
    }),
  ],
}
