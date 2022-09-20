import { sharedDataOp } from './shared-data-op'

describe('sharedDataOp', () => {
  it('should work', () => {
    expect(sharedDataOp()).toEqual('shared-data-op')
  })
})
