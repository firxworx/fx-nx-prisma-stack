import { render, screen } from '@testing-library/react'

import { FormTextArea } from '../components/FormTextArea'
import { TestForm } from './test-utils/components/TestForm'

describe('FormTextArea', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TestForm>
        <FormTextArea name="test" label="Test Label" />
      </TestForm>,
    )
    expect(baseElement).toBeTruthy()
    expect(screen.findByText(/Test Label/i)).toBeTruthy()
  })
})
