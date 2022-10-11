import { render } from '@testing-library/react'

import { FormContainer } from '../components/FormContainer'

describe('FormContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FormContainer />)
    expect(baseElement).toBeTruthy()
  })
})
