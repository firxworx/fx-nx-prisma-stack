import { Test } from '@nestjs/testing'
import { SharedNestjsAuthController } from './shared-nestjs-auth.controller'

describe('SharedNestjsAuthController', () => {
  let controller: SharedNestjsAuthController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [],
      controllers: [SharedNestjsAuthController],
    }).compile()

    controller = module.get(SharedNestjsAuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeTruthy()
  })
})
