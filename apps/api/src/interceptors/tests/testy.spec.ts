import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { INestApplication, HttpStatus, Injectable, Controller, Get } from '@nestjs/common'

import { SanitizeResponseInterceptor } from '../sanitize-response.interceptor'
import { AppModule } from '../../app.module'

@Controller('test')
@Injectable()
export class TestController {
  @Get('bad')
  bad() {
    return {
      password: 'secret',
      refreshToken: 'bad',
    }
  }

  @Get('bad-nested')
  badNested() {
    return {
      name: 'hello',
      password: 'secret',
      email: 'x@example.com',
      nested: {
        captain: 'Picard',
        refreshToken: 'naughty value',
        level: {
          id: 12,
          password: 'whoops',
        },
      },
    }
  }
}

describe('SanitizeResponseInterceptor', () => {
  let app: INestApplication

  afterAll(async () => {
    await app.close()
  })

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalInterceptors(new SanitizeResponseInterceptor())
    await app.init()
  })

  it('should have the interceptor data', async () => {
    const ResponseData$ = await request(app.getHttpServer()).put('/test').send()

    expect(ResponseData$.status).toBe(HttpStatus.OK)
    // e.g. expect(ResponseData$.headers['myheader']).toBe('interceptor')
  })
})
