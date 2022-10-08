import React from 'react'
import { render } from '@testing-library/react'

import Index from '../src/pages/index'
import type { NextRouter } from 'next/router'
import { mockRouter } from './test-utils/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

jest.mock('next/router', () => ({
  useRouter(): NextRouter {
    return { ...mockRouter }
  },
}))

describe('Index', () => {
  const queryClient = new QueryClient()

  it('should render successfully', () => {
    const { baseElement } = render(
      <QueryClientProvider client={queryClient}>
        <Index />
      </QueryClientProvider>,
    )
    expect(baseElement).toBeTruthy()
  })
})
