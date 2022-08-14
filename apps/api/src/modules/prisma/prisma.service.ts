import { Injectable, OnModuleInit, INestApplication, Logger } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client' // '../../generated/prisma-client' // import from custom output path specified in schema.prisma

/**
 * NestJS service that wraps the Prisma database client.
 *
 * @see {@link https://docs.nestjs.com/recipes/prisma}
 * @see {@link https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-nestjs/src}
 */
@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'warn' | 'error'>
  implements OnModuleInit
{
  private readonly logger = new Logger(PrismaService.name)

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
      errorFormat: 'colorless',
    })
  }

  async onModuleInit() {
    this.$on('error', (event: Prisma.LogEvent) => {
      this.logger.error(event.message, event)
    })

    this.$on('query', (event: Prisma.QueryEvent) => {
      this.logger.debug({ query: event.query, duration: event.duration }, 'Prisma Query Duration')
    })

    await this.$connect()
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close()
    })
  }
}
