import React, { useEffect } from 'react'
import { render, renderHook } from '@testing-library/react'
import { useIsMounted } from '../../index'

// calls a function only if the component is mounted

type TestCallbackInputValue = 'mounted' | 'unmounted'

interface TestComponentProps {
  callback: (input: TestCallbackInputValue) => void
}

const TestComponent = React.forwardRef<HTMLDivElement, TestComponentProps>(function TestComponent({ callback }, ref) {
  const isMounted = useIsMounted()

  useEffect(() => {
    if (isMounted()) {
      callback('mounted')
    }

    return (): void => {
      if (isMounted()) {
        callback('unmounted')
      }
    }
  }, [isMounted, callback])

  return <div ref={ref} />
})

describe('useIsMounted', () => {
  it('should return true when component is mounted', () => {
    const { result } = renderHook(() => useIsMounted())

    // act(() => {
    //   result.current()
    // })

    expect(result.current()).toBe(true)
  })

  it('should return true when component is mounted', () => {
    let testCallbackValue: TestCallbackInputValue | undefined = undefined
    const testCallback = (input: TestCallbackInputValue): void => {
      testCallbackValue = input
    }

    const { baseElement, unmount } = render(<TestComponent callback={testCallback} />)
    expect(baseElement).toBeTruthy()
    expect(testCallbackValue).toBe('mounted')
    unmount()
    expect(testCallbackValue).not.toBe('unmounted')
  })
})
