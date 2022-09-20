import { render } from '@testing-library/react'

import SharedReactForms from './shared-react-forms'

describe('SharedReactForms', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SharedReactForms />)
    expect(baseElement).toBeTruthy()
  })
})
