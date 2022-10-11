import { render } from '@testing-library/react'

import { BouncyLoader } from '../components/BouncyLoader'

describe('BouncyLoader', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BouncyLoader />)
    expect(baseElement).toBeTruthy()
  })
})
