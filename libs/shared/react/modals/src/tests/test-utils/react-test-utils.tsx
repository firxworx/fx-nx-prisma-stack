import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import { ModalContextProvider } from '../..'

/**
 * Test helper to render components under a `ModalContextProvider`.
 * Use as an alternative to `render()` from `@testing-library/react`.
 */
export const renderWithContextProvider = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>,
): RenderResult => {
  const result = render(<ModalContextProvider>{ui}</ModalContextProvider>, options)

  return {
    ...result,

    // override rerender to only update children of the provider
    rerender: (ui) => renderWithContextProvider(ui, { container: result.container }),
  }
}
