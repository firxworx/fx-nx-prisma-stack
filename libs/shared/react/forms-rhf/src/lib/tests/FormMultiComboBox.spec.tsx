import { render, screen } from '@testing-library/react'

import { FormMultiComboBox } from '../components/FormMultiComboBox'
import { TestForm } from './test-utils/components/TestForm'

describe('FormMultiComboBox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TestForm>
        <FormMultiComboBox
          name="text"
          label="Test Label"
          options={[
            { label: 'AAA', value: 'aaa' },
            { label: 'BBB', value: 'bbb' },
            { label: 'CCC', value: 'ccc', disabled: true },
          ]}
        />
      </TestForm>,
    )
    expect(baseElement).toBeTruthy()
    expect(screen.findByText(/Test Label/i)).toBeTruthy()
  })
})
