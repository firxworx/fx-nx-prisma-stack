import { PrismaCommonErrorCode } from '../constants/prisma-common-error-code.enum'
import { PrismaMigrationErrorCode } from '../constants/prisma-migration-error-code.enum'
import { PrismaQueryErrorCode } from '../constants/prisma-query-error-code.enum'

/**
 * Prisma Error Codes as a const object.
 *
 * Each of the constituent `PrismaCommonErrorCode`, `PrismaMigrationErrorCode`, and `PrismaQueryErrorCode`
 * are defined as enums with values that correspond to the `error.code` property of Errors that may be
 * thrown by Prisma.
 *
 * Credit to @vinpac on GitHub for capturing these and publishing the `prisma-error-enum` package.
 * Note the package contains `as const` objects vs. actual TS enums which are close but do have some
 * differences especially with respect to using them with interfaces + types.
 *
 * @see {@link https://github.com/vinpac/prisma-error-enum}
 * @see {@link https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes}
 */
export const PrismaErrorCode = {
  ...PrismaCommonErrorCode,
  ...PrismaMigrationErrorCode,
  ...PrismaQueryErrorCode,
} as const

/**
 * Type `PrismaErrorCode` representing a union of the `PrismaCommonErrorCode`, `PrismaMigrationErrorCode`,
 * and `PrismaQueryErrorCode` enum types.
 *
 * The type as impemented below is equivalent to:
 *
 * ```ts
 * export type PrismaErrorCode = PrismaCommonErrorCode | PrismaMigrationErrorCode | PrismaQueryErrorCode
 * ```
 *
 * @see PrismaErrorCode object const assertion defined via spreading each of the prisma error code groups.
 */
export type PrismaErrorCode = typeof PrismaErrorCode[keyof typeof PrismaErrorCode]
