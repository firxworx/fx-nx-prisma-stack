import * as os from 'os'
import { registerAs } from '@nestjs/config'
import pino from 'pino'
import 'pino-pretty'

import type { LoggerConfig } from './types/logger-config.interface'

/**
 * Configuration for logger powered by pino and tailored for nestjs by nestjs-pino.
 */
export default registerAs('logger', (): LoggerConfig => {
  /**
   * Flag for sync/async logging.
   *
   * Per docs, `sync` is generally best set to `true` for host environments that modify stdout, e.g. AWS Lambda.
   * Async improves performance at expense of possible lost log events in sudden failure cases (e.g. power cut).
   *
   * @see {@link https://github.com/pinojs/pino/blob/master/docs/asynchronous.md}
   */
  const sync = String(process.env.API_LOGS_SYNC) === 'ON' ? true : process.env.NODE_ENV === 'test' ? true : false

  return {
    nestJsPino: {
      // @see <https://github.com/pinojs/pino-http>
      pinoHttp: {
        base: {
          app: process.env.API_TAG_ID ?? 'fx',
          version: {
            rest: process.env.API_VERSION ?? '', // e.g. v1 / public rest api version
          },
          hostname: os.hostname(),
        },
        level: process.env.LOG_LEVEL ?? 'debug', // @todo validate types nestjs-pino

        // set context value 'HTTP' for auto http request logging to facilitate grouping, filtering, etc
        customProps: (_req, _res) => ({
          context: 'HTTP',
        }),

        // set custom log levels depending on response status code
        // note: nestjs-pino maps pino `trace` and `info` to nestjs `verbose` and `log` to satisfy LoggerService interface
        customLogLevel: (_req, res): pino.LevelWithSilent => {
          // if (res.err)...
          if (res.statusCode >= 500) {
            return 'error'
          }

          if (res.statusCode >= 400) {
            return 'warn'
          }

          return 'info'
        },

        // set a request identifier - @see <https://github.com/pinojs/pino-http#pinohttpopts-stream>
        // @future note could also leverage aws for request tracing features
        // genReqId: (req: Record<string, any>): { sessionId: string; reqId: string } => ({
        //   // https://github.com/goldbergyoni/nodebestpractices/blob/49da9e5e41bd4617856a6ecd847da5b9c299852e/sections/production/assigntransactionid.md
        //   sessionId: req.session?.id,
        //   reqId: uuid(),
        // }),

        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
                // @see <https://github.com/pinojs/pino-pretty>
                target: 'pino-pretty',
                options: {
                  // levelFirst: true,
                  // translateTime: "yyyy-MM-dd'T'HH:mm:ss.l'Z'", // @see options at <https://www.npmjs.com/package/dateformat>
                  // colorize: true,
                  singleLine: true,
                  // errorLikeObjectKeys: ['err', 'error'],
                  sync,

                  // unused
                  // translateTime: 'UTC:yyyy-mm-dd hh:MM:ss TT Z',
                  // ignore: "pid,hostname,context,req,res,responseTime",
                  // messageFormat: '{req.headers.x-correlation-id} [{context}] {msg}',
                },
              },
        autoLogging: false, // toggle automatic 'request completed'/'request errored' log entries
        quietReqLogger: false,
        stream: pino.destination({
          minLength: 4096, // buffer logs before writing (applies when `sync: true`)
          sync,
        }),
      },
      // exclude: [{ method: RequestMethod.ALL, path: 'healthcheck' }], // e.g. exclude healthcheck logs
    },
  }
})
