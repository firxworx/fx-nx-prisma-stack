# @firx/react-forms-rhf

React component library with popular form components, integrated with react-hook-form.

All components that implement form "primitives" (e.g. FormInput, FormTextArea, etc) forward refs to the underlying HTML element.

More complex components such including Listbox + Combox type components are implemented with headlessui.

Styled with tailwindcss. Refer to the project's `tailwind-preset.js` for global styles and custom class definitions.

Generated with [Nx](https://nx.dev).

## Usage

Import components from `@firx/react-forms-rhf`, e.g.

```ts
import { FormInput } from '@firx/react-forms-rhf'
```

## Package details

- @firx/react-forms-rhf
- libs/shared/react/forms-rhf
- nx identifier: shared-react-forms-rhf

## Running unit tests

Run `nx test shared-react-forms-rhf` to execute the unit tests via [Jest](https://jestjs.io).
