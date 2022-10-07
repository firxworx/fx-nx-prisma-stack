import { render } from '@testing-library/react'

import SharedReactFormsRhf from './shared-react-forms-rhf'

describe('SharedReactFormsRhf', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SharedReactFormsRhf />)
    expect(baseElement).toBeTruthy()
  })
})
