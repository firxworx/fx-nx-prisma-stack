import { render, screen } from '@testing-library/react'

import { FormListBox } from '../components/FormListBox'
import { TestForm } from './test-utils/components/TestForm'

describe('FormListBox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TestForm>
        <FormListBox
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
