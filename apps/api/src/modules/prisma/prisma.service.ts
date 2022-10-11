import { Injectable, OnModuleInit, INestApplication, Logger } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'

/**
 * NestJS service that wraps the Prisma database client.
 *
 * Note: if you specify a custom output path in `schema.prisma` then import `Prisma` + `PrismaClient` from that
 * path. The default (`@prisma/client`) which references a path under `node_modules/` presents fewer hassles
 * with the time-of-writing version of nx because the generated client code can confuse nx's stock webpack config.
 *
 * @see {@link https://docs.nestjs.com/recipes/prisma}
 * @see {@link https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-nestjs/src}
 *
 * @see {@link https://github.com/prisma/prisma/issues/5273} re
 */
@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'warn' | 'error'>
  implements OnModuleInit
{
  private readonly logger = new Logger(this.constructor.name)

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'production'
          ? [
              { emit: 'event', level: 'error' },
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ]
          : [
              // { emit: 'event', level: 'query' },
              { emit: 'event', level: 'error' },
              { emit: 'event', level: 'warn' },
              { emit: 'stdout', level: 'query' },
              { emit: 'stdout', level: 'info' },
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ],
      errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
    })
  }

  async onModuleInit(): Promise<void> {
    this.$on('error', (event: Prisma.LogEvent) => {
      this.logger.error(event.message, event)
    })

    this.$on('query', (event: Prisma.QueryEvent) => {
      this.logger.debug({ query: event.query, duration: event.duration }, 'Prisma Query Duration')
    })

    await this.$connect()
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    this.$on('beforeExit', async () => {
      await app.close()
    })
  }
}
