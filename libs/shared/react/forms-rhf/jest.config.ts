/* eslint-disable */
export default {
  displayName: 'shared-react-forms-rhf',
  preset: '../../../../jest.preset.js',
  transform: {
    // added missing `presets` arg to support testing components that import from other libs in the project monorepo
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/shared/react/forms-rhf',
}
