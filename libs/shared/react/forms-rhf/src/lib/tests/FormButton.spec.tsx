import { render } from '@testing-library/react'

import { TestForm } from './test-utils/components/TestForm'
import { FormButton } from '../components/FormButton'

describe('FormButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TestForm>
        <FormButton type="submit" />
      </TestForm>,
    )
    expect(baseElement.hasChildNodes()).toBeTruthy()
  })
})
