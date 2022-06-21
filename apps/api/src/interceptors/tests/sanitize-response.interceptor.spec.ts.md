import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { INestApplication, HttpStatus } from '@nestjs/common'

import { EmulatorHeadersInterceptor } from '@LIBRARY/interceptors/emulator-headers.interceptor'

import { AppModule } from '@APP/app.module'

describe('Header Intercepter', () => {
  let app: INestApplication

  afterAll(async () => {
    await app.close()
  })

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalInterceptors(new EmulatorHeadersInterceptor())
    await app.init()
  })

  it('./test (PUT) should have the interceptor data', async () => {
    const ResponseData$ = await request(app.getHttpServer()).put('/test').send()

    expect(ResponseData$.status).toBe(HttpStatus.OK)
    expect(ResponseData$.headers['myheader']).toBe('interceptor')
  })
})

const RETURN_VALUE = 'test'

@Injectable()
export class OverrideInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return of(RETURN_VALUE)
  }
}

@Injectable()
export class TransformInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map((data) => ({ data })))
  }
}

@Injectable()
export class StatusInterceptor {
  constructor(private readonly statusCode: number) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const ctx = context.switchToHttp()
    const res = ctx.getResponse()
    res.status(this.statusCode)
    return next.handle().pipe(map((data) => ({ data })))
  }
}

@Injectable()
export class HeaderInterceptor {
  constructor(private readonly headers: object) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const ctx = context.switchToHttp()
    const res = ctx.getResponse()
    for (const key in this.headers) {
      if (this.headers.hasOwnProperty(key)) {
        res.header(key, this.headers[key])
      }
    }
    return next.handle().pipe(map((data) => ({ data })))
  }
}

function createTestModule(interceptor) {
  return Test.createTestingModule({
    imports: [AppModule],
    providers: [
      {
        provide: APP_INTERCEPTOR,
        useValue: interceptor,
      },
    ],
  }).compile()
}

describe('Interceptors', () => {
  let app: INestApplication

  it(`should transform response (sync)`, async () => {
    app = (await createTestModule(new OverrideInterceptor())).createNestApplication()

    await app.init()
    return request(app.getHttpServer()).get('/hello').expect(200, RETURN_VALUE)
  })

  it(`should map response`, async () => {
    app = (await createTestModule(new TransformInterceptor())).createNestApplication()

    await app.init()
    return request(app.getHttpServer()).get('/hello').expect(200, { data: 'Hello world!' })
  })

  it(`should map response (async)`, async () => {
    app = (await createTestModule(new TransformInterceptor())).createNestApplication()

    await app.init()
    return request(app.getHttpServer()).get('/hello/stream').expect(200, { data: 'Hello world!' })
  })

  it(`should map response (stream)`, async () => {
    app = (await createTestModule(new TransformInterceptor())).createNestApplication()

    await app.init()
    return request(app.getHttpServer()).get('/hello/async').expect(200, { data: 'Hello world!' })
  })

  it(`should modify response status`, async () => {
    app = (await createTestModule(new StatusInterceptor(400))).createNestApplication()

    await app.init()
    return request(app.getHttpServer()).get('/hello').expect(400, { data: 'Hello world!' })
  })

  it(`should modify Authorization header`, async () => {
    const customHeaders = {
      Authorization: 'jwt',
    }

    app = (await createTestModule(new HeaderInterceptor(customHeaders))).createNestApplication()

    await app.init()
    return request(app.getHttpServer()).get('/hello').expect(200).expect('Authorization', 'jwt')
  })

  afterEach(async () => {
    await app.close()
  })
})
