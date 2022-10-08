import { render, screen } from '@testing-library/react'

import { FormMultiListBox } from '../components/FormMultiListBox'
import { TestForm } from './test-utils/components/TestForm'

describe('FormMultiListBox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TestForm>
        <FormMultiListBox
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
