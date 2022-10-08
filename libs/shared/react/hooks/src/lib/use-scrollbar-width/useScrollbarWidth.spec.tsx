import { renderHook } from '@testing-library/react'
import { useScrollbarWidth } from '../../index'

describe('useScrollbarWidth', () => {
  it('returns a numerical value', () => {
    // let testValue: unknown
    const { result } = renderHook(() => useScrollbarWidth())

    // act(() => {
    //   testValue = result.current
    // })

    expect(typeof result.current === 'number').toBe(true)
  })
})
