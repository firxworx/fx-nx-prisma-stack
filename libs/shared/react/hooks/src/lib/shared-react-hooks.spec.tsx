import { render } from '@testing-library/react'

import SharedReactHooks from './shared-react-hooks'

describe('SharedReactHooks', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SharedReactHooks />)
    expect(baseElement).toBeTruthy()
  })
})
