# @firx/react-modals

React modal component library that provides modal capabilities to a React app.

The library ships a `ModalContextProvider` component to wrap around a top-level app component and a `useModalContext()` hook that descendent components can use to open + close modal dialogs.

The implementation supports multiple open dialogs at the same time that open on top of one another. This feature helps developers implement high-calibre UI's that provide a polished "app-like" user experience. For example, an app can safely trigger app-wide alerts independently and conflict-free vs. any feature-related modals that may be open.

## Usage

### Setup

Wrap the `ModalContextProvider` component around a parent in the React tree to enable its children to use the `useModalContext()` hook.

In a NextJS app the best candidate is typically a top-level component in `pages/_app.tsx`.

```tsx
import { ModalContextProvider } from '@firx/react-modals'

const App: React.FC = () => <ModalContextProvider>{/* ... rest of app ... */}</ModalContextProvider>
```

Consider the placement of `ModalContextProvider` within your context hierarchy.

As this library renders modals in a React Portal and invoked via a context hook, the only React Context available inside of a modal is context that's parent to the `ModalContextProvider`.

The following example demonstrates adding `ModalContextProvider` a child of `react-query`'s `QueryClientProvider` so that modal contents can leverage certain functionality provided by `react-query`. A consequence is that the top-level `queryClient` config would not be able to invoke modals managed by the child `ModalContextProvider`.

```tsx
<QueryClientProvider client={queryClient}>
  <ModalContextProvider>...</ModalContextProvider>
</QueryClientProvider>
```

### Using useModalContext to open a modal

Components can invoke the `useModalContext()` hook to obtain a 2-item array (tuple) that contains functions to open and close a new modal dialog.

The first item in the return array is a `showModal()` function and the second item is an optional `hideModal()` function.

The hook accepts three arguments:

- a object of `ModalBodyProps` to be passed to this library's `ModalBody` wrapper on render
- modal contents as a React element or render prop function to render as a child inside of `ModalBody`
- _optional_ dependency array to specify conditions for the hook to re-render the modal contents

#### Argument 1: ModalBodyProps

The most common props are `title` and `variant`.

- Refer to the `ModalBodyProps` interface for a complete set of accepted props.
- Refer to the enum `ModalVariant` for all accepted `variant` values.

Variants `ALERT`, `SUCCESS`, `WARN`, and `ERROR` will render an appropriate SVG icon as well as a button to close the modal.

Variant `FORM` is well-suited for cases where the modal content is a web form.

Variant `BLANK` is an option for limited functionality that excludes headings + actions. It supports the case where you may require a blank canvas to implement everything yourself in modal contents.

The optional `action` prop supports passing a function to the `ModalBody`. If specified, the modal will render with an action button at the bottom of the modal body that will the function and close the modal when clicked.

Specify an `actionLabel` prop to provide a custom caption for the `action` button.

#### Argument 2: Modal Content as React Element or render props

The modal's content may be provided as a React element or as a function per the render props pattern (i.e. a function that returns a React element).

If using the render-props pattern, the function will be passed a `hideModal` function as an argument. You can call this function from within the implementation of your modal content to close the modal if/as required.

#### Argument 3: Dependency array

In many cases only the first two arguments are necessary, such as modals that render simple static alerts.

The third dependency array argument is relevant if a modal's contents are dependent on variables or functions from parent component(s) that are subject to change.

When dependencies change a re-render of the modal body is required to reflect the changed values. Use this argument in the same way as the dependency array of any of React's built-in hooks such as useEffect. Similar to React, items in the dependency array should be variables that reference simple values vs. complex expressions that require evaluation.

Example case of a modal that requires a dependency array:

> A component presents a list of users where each user has a corresponding "edit details" button. Clicking a user's "edit details" button opens a dialog with a form for editing that user's details. The component invokes the `useModalContext()` hook once, specifying modal contents that is dependent on the currently selected user. The dependency array should be set so that the modal contents is re-rendered whenever the currently selected user changes.

### Usage example

```tsx
import { ModalVariant, useModalContext } from '@firx/react-modals'

const ExampleComponent: React.FC = () => {
  const [showModal] = useModalContext(
    {
      title: 'Hello World',
      variant: ModalVariant.DEFAULT,
    },
    (hideModal) => (
      <div>
        <p>I am a modal</p>
        <button type="button" onClick={hideModal}>
          Close Me
        </button>
      </div>
    ),
  )

  return (
    <h2>I am a component</h2>
    <button type="button" onClick={showModal}>
      Open Modal
    </button>
  )
}
```

## Implementation notes

This library leverages the following popular + mature package dependencies:

- `react-modal-hook`
- `react-transition-group`
- `focus-trap-react`

The `Transition` component from `@headlessui/react` is used for CSS-driven transitions because it plays very nicely with TailwindCSS by the same authors. The `Dialog` implementation from `@headlessui/react` is not used due design decisions and issues that have historically been incompatible with the goals + requirements of this library.

In the code take care to observe the significant difference in purpose and functionality of `react-transition-group`'s `Transition` component vs. `@headlessui/react`'s `Transition`.

Styling is via tailwindcss. Refer to the project's `tailwind-preset.js` for global styles and custom class definitions.

Generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test shared-react-modals` to execute the unit tests via [Jest](https://jestjs.io).
