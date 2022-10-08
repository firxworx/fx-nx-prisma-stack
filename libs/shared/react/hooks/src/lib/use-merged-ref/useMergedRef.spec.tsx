import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { useMergedRef } from '../../index'

const TEST_VALUE = 'test-value' as const

interface TestComponentProps {
  refs: React.ForwardedRef<HTMLDivElement>[]
}

/**
 * Test component that forwards its ref and accepts an array of refs via its `refs` prop.
 *
 * All given refs are merged using the `useMergedRef()` hook and the combined ref is applied
 * to an underlying div element.
 */
const TestComponent = React.forwardRef<HTMLDivElement, TestComponentProps>(function TestComponent(props, ref) {
  const componentRef = React.useRef<HTMLDivElement>(null)
  const combinedRef = useMergedRef<HTMLDivElement>(...props.refs, ref, componentRef)

  return <div ref={combinedRef}>{TEST_VALUE}</div>
})

describe('useMergedRef', () => {
  it('should return a merged ref that combines the refs provided as input args', async () => {
    const testObjectRefForward = React.createRef<HTMLDivElement>()
    const testObjectRefMerged = React.createRef<HTMLDivElement>()

    let testFunctionRefValue: HTMLDivElement | null = null
    const testFunctionRef = (node: HTMLDivElement | null): void => {
      testFunctionRefValue = node
    }

    render(<TestComponent ref={testObjectRefForward} refs={[testObjectRefMerged, testFunctionRef]} />)

    // await waitFor(() => )

    // await screen.getByText(TEST_VALUE)
    const rerendered = await waitFor(() => screen.getByText(TEST_VALUE))

    expect(rerendered instanceof HTMLElement).toBe(true)
    expect(testObjectRefForward.current instanceof HTMLDivElement).toBe(true)
    // expect(testObjectRefForward.current?.innerText).toBe(TEST_VALUE)
    expect(testObjectRefMerged.current instanceof HTMLDivElement).toBe(true)
    // expect(testObjectRefMerged.current?.innerText).toBe(TEST_VALUE)
    expect((testFunctionRefValue ?? {}) instanceof HTMLDivElement).toBe(true)
    // expect(testFunctionRefValue !== null ? (testFunctionRefValue as HTMLDivElement).innerText : '').toBe(TEST_VALUE)
  })
})
