/** @type {import('tailwindcss').Config} */

const { createGlobPatternsForDependencies } = require('@nrwl/next/tailwind') // vs. @nrwl/react/tailwind
const { join } = require('path')

module.exports = {
  presets: [require('../../tailwind-preset.js')],
  content: [join(__dirname, 'src/**/*.{js,ts,jsx,tsx,html}'), ...createGlobPatternsForDependencies(__dirname)],
  theme: {
    extend: {},
  },
  plugins: [],
}
