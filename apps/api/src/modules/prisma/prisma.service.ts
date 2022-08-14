import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common'
import { PrismaClient } from '@prisma/client' // '../../generated/prisma-client' // import from custom output path specified in schema.prisma

/**
 * NestJS service that wraps the Prisma database client.
 *
 * @see {@link https://docs.nestjs.com/recipes/prisma}
 * @see {@link https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-nestjs/src}
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // @todo configure PrismaService to use app logger after adding + configuring an improved logger to project
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'production'
          ? [
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ]
          : [
              // { emit: 'event', level: 'query' },
              { emit: 'stdout', level: 'query' },
              { emit: 'stdout', level: 'info' },
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ],
      errorFormat: 'colorless',
    })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close()
    })
  }
}
