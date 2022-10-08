const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')

const defaultTheme = require('tailwindcss/defaultTheme')

const colord = require('colord').colord
// const alpha = (c, value) => colord(c).alpha(value).toRgbString()
const lighten = (c, value) => colord(c).lighten(value).toRgbString()
const darken = (c, value) => colord(c).darken(value).toRgbString()

module.exports = {
  theme: {
    screens: {
      xxs: '315px', // 320px is about as small as a smartphone gets
      xs: '475px',
      ...defaultTheme.screens,
    },
    extend: {
      animation: {
        // loading bounce (refer to inline plugin `Utilities` below for animation delays)
        'bouncy-opacity': 'bouncy-opacity 0.75s infinite alternate',
      },
      keyframes: {
        'bouncy-opacity': {
          from: {
            opacity: 0.8,
            transform: 'translate3d(0, 0.5rem, 0)',
          },
          to: {
            opacity: 0.1,
            transform: 'translate3d(0, -0.5rem, 0)',
          },
        },
      },
      spacing: {
        1.25: '0.3125rem',
      },
      padding: {
        '1/3': '33.33333%',
        '2/3': '66.66666%',
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
        85: '0.85',
      },
      grayscale: {
        25: '25%',
        50: '50%',
        75: '75%',
      },
      // add zIndex values from 60-100 in steps of 10
      zIndex: Array.from({ length: 5 }, (_, i) => (6 + i) * 10).reduce(
        (acc, curr) => ({ ...acc, [curr]: String(curr) }),
        {},
      ),
      colors: {
        fx1: {
          50: '#f1f5f9',
          100: '#e9eff5',
          200: '#cedde9',
          300: '#a3c0d6',
          400: '#729fbe',
          500: '#5083a7',
          600: '#3d698c',
          700: '#325572',
          800: '#2d495f',
          900: '#293e51',
        },
        // palette: {},
        a11y: {
          ring: {
            highlight: colors.amber[300],
            DEFAULT: colors.sky[100],
            dark: colors.sky[200], // use if component's background color is similar to DEFAULT
            line: colors.slate[300], // only if required for contrast e.g. ToggleSwitch
          },
        },
        button: {
          primary: colors.sky[700],
        },
        heading: {
          primary: {
            DEFAULT: colors.sky[900],
          },
        },
        action: {
          // dark high-contrast (vs light background) color
          primary: {
            idle: colors.slate[400],
            half: lighten(colors.sky[900], 0.5),
            lightest: colors.sky[500],
            lighter: colors.sky[600],
            DEFAULT: colors.sky[900],
            alpha: colord(colors.sky[900]).alpha(0.5).toRgbString(),
            hover: lighten(colors.sky[900], 0.1),
            darker: colors.sky[800],
            darkest: colors.sky[900],
          },
        },
        brand: {
          primary: {
            lightest: colors.sky[500],
            lighter: colors.sky[600],
            DEFAULT: colors.sky[700],
            darker: colors.sky[800],
            darkest: colors.sky[900],
          },
        },
        palette: {
          form: {
            border: {
              DEFAULT: colors.slate[300],
            },
            input: {
              DEFAULT: colors.slate[800],
            },
            label: {
              DEFAULT: colors.slate[700],
              focus: colors.sky[900],
            },
            placeholder: {
              DEFAULT: colors.slate[500], // WCAG 2.0
            },
          },
        },
        form: {
          placeholder: {
            DEFAULT: colors.slate[500], // WCAG 2.0
          },
        },
        error: {
          DEFAULT: '#a72e2e',
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

    // headlessui tailwindcss plugin - adds modifiers for headlessui including ui-open:*, ui-active:*, etc
    require('@headlessui/tailwindcss'),

    // add custom styles via inline custom plugin
    plugin(function ({ addBase, addComponents, addUtilities }) {
      const webkitSearchInputXIconTarget =
        'input[type="search"]::-webkit-search-decoration, input[type="search"]::-webkit-search-cancel-button, input[type="search"]::-webkit-search-results-button, input[type="search"]::-webkit-search-results-decoration'

      const ieSearchInputXIconTarget =
        'input.hide-clear[type=search]::-ms-clear, input.hide-clear[type=search]::-ms-reveal'

      // these selectors match + override the selector used by the @tailwindcss/forms plugin
      const formInputTargets = `[type='text']:not(.fx-custom-input), [type='email'], [type='url'], [type='password'], [type='number'], [type='date'], [type='datetime-local'], [type='month'], [type='search'], [type='tel'], [type='time'], [type='week'], [multiple], textarea, select`
      // const formInputFocusTargets = `[type='text']:focus:not(.fx-custom-input), [type='email']:focus, [type='url']:focus, [type='password']:focus, [type='number']:focus, [type='date']:focus, [type='datetime-local']:focus, [type='month']:focus, [type='search']:focus, [type='tel']:focus, [type='time']:focus, [type='week']:focus, [multiple]:focus, textarea:focus, select:focus`
      // const buttonTargets = `button, [type='button'], [type='reset'], [type='submit']`

      addBase({
        // always show scrollbar to help avoid horizontal jank especially on Win/PC's during loading/modals/transitions
        body: {
          overflowY: 'scroll',
          scrollBehavior: 'smooth',
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
        // [formInputTargets]: {
        //   '@apply fx-form-input': {},
        // },
        strong: {
          '@apply font-medium text-slate-800': {},
        },
        // [formInputFocusTargets]: {
        // }
      })
      addComponents({
        '.fx-layout-max-width': {
          '@apply max-w-6xl': {},
        },
        '.fx-layout-padding-x': {
          '@apply px-4 sm:px-6 xl:px-8': {},
        },
        '.fx-layout-padding-y': {
          '@apply pt-0 xs:pt-4 sm:pt-6 pb-10 xs:pb-12 sm:pb-16': {},
        },
        '.fx-modal-body-shadow': {
          '@apply shadow-[0_0_24px_8px_rgba(51,65,85,0.5)]': {}, // slate-700 50% opacity
        },
        // add modal body shadow to ::after pseudo element, to transition in after modal body renders for performance
        // usage: add conditional styles `after:opacity-0` when !hasEntered + `after:opacity-100` when hasEntered
        '.fx-modal-body-after-shadow': {
          '@apply relative after:pointer-events-none': {},
          "@apply after:absolute after:top-0 after:left-0 after:w-full after:h-full after:content-['']": {},
          '@apply after:rounded-md after:shadow-[0_0_24px_8px_rgba(51,65,85,0.5)]': {}, // slate-700 50% opacity
          '@apply after:transition-opacity after:duration-100': {},
        },
        '.fx-box': {
          'p-2 xs:p-4 sm:p-6 lg:p-8': {},
        },
        '.fx-button-base, button.fx-button-base, a.fx-button-base': {
          // px-2 py-1
          '@apply inline-flex items-center justify-center px-3 py-1.5 xs:px-4 xs:py-2 rounded-md': {},
          '@apply text-base font-medium tracking-tight fx-focus-ring transition-colors': {},
        },
        '.fx-button-standard-border': {
          '@apply border-2': {},
        },
        '.fx-button-thin-border': {
          '@apply border': {},
        },
        'button.fx-button-solid-primary, a.fx-button-solid-primary': {
          '@apply border-sky-800 bg-sky-800 text-white hover:bg-sky-900 hover:bg-sky-900': {},
        },
        'button.fx-button-solid-primary-disabled, a.fx-button-solid-primary-disabled': {
          '@apply border-slate-200 bg-slate-200 text-slate-400 cursor-not-allowed': {},
        },
        'button.fx-button-outline-primary, a.fx-button-outline-primary': {
          '@apply bg-transparent border-sky-800 text-sky-800 hover:bg-slate-100 hover:border-sky-900 hover:text-sky-900':
            {},
        },
        'button.fx-button-outline-primary-disabled, a.fx-button-outline-primary-disabled': {
          '@apply bg-transparent border-slate-300 text-slate-400 cursor-not-allowed': {},
        },
        'button.fx-button-transparent-primary, a.fx-button-transparent-primary': {
          '@apply bg-transparent border-transparent text-sky-800 hover:text-sky-900': {},
        },
        'button.fx-button-transparent-primary-disabled, a.fx-button-transparent-primary-disabled': {
          '@apply bg-transparent border-transparent text-slate-400 cursor-not-allowed': {},
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
          '@apply font-medium text-action-primary fx-focus-ring-form ring-offset-1 focus:rounded-sm transition-colors duration-150':
            {},
          '&:hover': {
            '@apply text-action-primary-hover underline': {},
          },
          '&:active': {
            '@apply text-action-primary-hover': {},
          },
        },
        '.fx-form-input': {
          '@apply border rounded-md': {},
          '@apply border-palette-form-border text-palette-form-input placeholder:text-palette-form-placeholder': {},
          // '@apply fx-focus-ring-form': {},
        },
        '.fx-form-label': {
          // requires that a parent wrapping div have the tailwind 'group' class applied
          '@apply block text-sm font-normal text-left': {},
          '@apply text-palette-form-label group-focus-within:font-medium group-focus-within:text-palette-form-label-focus':
            {},
        },
        // round the corners and add a border seperator to sets of adjacent items e.g. list items
        // usage: apply this class along with definitions for border width + color
        '.fx-rounded-set-md': {
          '@apply border-x border-y': {},
          '@apply first:rounded-t-md first:border-t first:border-b-0 last:rounded-b-md last:border-t-0 last:border-b':
            {},
        },
        // if parent has `-space-y-px` (this variant is useful if borders of individual items in the set may be highlighted)
        '.fx-rounded-set-md-parent': {
          '@apply border': {},
          '@apply first:rounded-t-md last:rounded-b-md': {},
        },
        // apply to parent containing set of vertical items (e.g. ul) for overall round borders + divider between each
        '.fx-set-parent-rounded-md': {
          '@apply -space-y-px': {},
          '&>*': {
            // tailwind 3.1 arbitrary variants e.g. className="[&>a]:text-black"
            '@apply border': {},
            '@apply first:rounded-t-md last:rounded-b-md': {},
          },
        },
      })
      addUtilities({
        // add .animation-delay-100 to .animation-delay-900
        ...Array.from({ length: 9 }, (_, i) => i).reduce(
          (acc, i) => ({ ...acc, [`.animation-delay-${i * 100}`]: { animationDelay: `0.${i}s` } }),
          {},
        ),
      })
    }),
  ],
}
