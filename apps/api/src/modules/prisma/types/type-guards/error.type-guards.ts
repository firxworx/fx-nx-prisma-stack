import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { PrismaQueryErrorCode } from '../../constants/prisma-query-error-code.enum'

// P2001 (record searched for in where clause condition does not exist)
export function isRecordDoesNotExistError(
  error: unknown,
): error is PrismaClientKnownRequestError & { code: PrismaQueryErrorCode.RecordDoesNotExist } {
  return error instanceof PrismaClientKnownRequestError && error.code === PrismaQueryErrorCode.RecordDoesNotExist
}

// P2002 (unique constraint violation)
export function isUniqueConstraintViolationError(
  error: unknown,
): error is PrismaClientKnownRequestError & { code: PrismaQueryErrorCode.UniqueConstraintViolation } {
  return error instanceof PrismaClientKnownRequestError && error.code === PrismaQueryErrorCode.UniqueConstraintViolation
}

// P2025 (operation failed because it depends on 1+ records that were not found)
export function isRecordsNotFoundError(
  error: unknown,
): error is PrismaClientKnownRequestError & { code: PrismaQueryErrorCode.RecordsNotFound } {
  return error instanceof PrismaClientKnownRequestError && error.code === PrismaQueryErrorCode.RecordsNotFound
}
