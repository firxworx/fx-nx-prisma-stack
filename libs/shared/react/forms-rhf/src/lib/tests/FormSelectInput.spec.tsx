import { render, screen } from '@testing-library/react'

import { FormSelectInput } from '../components/FormSelectInput'
import { TestForm } from './test-utils/components/TestForm'

describe('FormSelectInput', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TestForm>
        <FormSelectInput name="test" label="Test Label" />
      </TestForm>,
    )
    expect(baseElement).toBeTruthy()
    expect(screen.findByText(/Test Label/i)).toBeTruthy()
  })
})
