import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common'
import { Prisma, PrismaPromise } from '@prisma/client'
import { NotFoundError, PrismaClientKnownRequestError } from '@prisma/client/runtime'

import type { AuthUser } from '../auth/types/auth-user.type'
import { PrismaQueryErrorCode } from './constants/prisma-query-error-code.enum'

// eslint-disable-next-line
type ConstructorType<T> = new (...args: any[]) => T

export interface PrismaDelegate {
  aggregate(data: unknown): PrismaPromise<unknown>
  count(data: unknown): PrismaPromise<unknown>
  create(data: unknown): PrismaPromise<unknown>
  createMany(data: unknown): PrismaPromise<Prisma.BatchPayload>
  delete(data: unknown): PrismaPromise<unknown>
  deleteMany(data: unknown): PrismaPromise<unknown>
  findFirst(data: unknown): PrismaPromise<unknown>
  findFirstOrThrow(data: unknown): PrismaPromise<unknown>
  findMany(data: unknown): PrismaPromise<unknown[]>
  findUnique(data: unknown): PrismaPromise<unknown>
  findUniqueOrThrow(data: unknown): PrismaPromise<unknown>
  update(data: unknown): PrismaPromise<any> // eslint-disable-line  @typescript-eslint/no-explicit-any
  updateMany(data: unknown): PrismaPromise<Prisma.BatchPayload>
  upsert(data: unknown): PrismaPromise<unknown>
  groupBy(data: unknown): PrismaPromise<unknown>
}

/**
 * Abstract class for a NestJS service that implements CRUD features for a given generic Prisma model.
 *
 * **WIP / EXPERIMENTAL**
 *
 * Work-in-progress concept/experiment for a reusable base service class that implements project conventions
 * and decently maintains typing. At the time of writing, it is too bad that Prisma doesn't export 'base' or
 * more 'generic' interfaces (e.g. `Delegate`) to better support this use-case.
 *
 * @wip @experimental
 *
 * @see {@link https://docs.nestjs.com/recipes/prisma}
 * @see {@link https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-nestjs/src}
 */
@Injectable()
export abstract class PrismaModelCrudService<D extends PrismaDelegate, RES_DTO, C_DTO, U_DTO> {
  private readonly _logger = new Logger(this.constructor.name)

  protected _ERROR_MESSAGES = {
    INTERNAL_SERVER_ERROR: 'Server Error',
  }

  protected _modelDelegate: D
  protected _ResponseDtoClass: ConstructorType<RES_DTO>
  protected _CreateDtoClass: ConstructorType<C_DTO>
  protected _UpdateDtoClass: ConstructorType<U_DTO>
  protected _options?: { delegateSelectClause?: Record<string, unknown> }

  protected constructor(
    modelDelegate: D,
    ResponseDtoClass: ConstructorType<RES_DTO>,
    CreateDtoClass: ConstructorType<C_DTO>,
    UpdateDtoClass: ConstructorType<U_DTO>,
    options?: { delegateSelectClause?: Record<string, unknown> },
  ) {
    this._modelDelegate = modelDelegate
    this._ResponseDtoClass = ResponseDtoClass
    this._CreateDtoClass = CreateDtoClass
    this._UpdateDtoClass = UpdateDtoClass
    this._options = options
  }

  protected getIdentifierWhereCondition(identifier: string | number): { uuid: string } | { id: number } {
    switch (typeof identifier) {
      case 'string': {
        return { uuid: identifier }
      }
      case 'number': {
        return { id: identifier }
      }
      default: {
        this._logger.error(`Unexpected invalid data identifier at runtime: ${identifier}`)
        throw new InternalServerErrorException(this._ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
      }
    }
  }

  protected handleError(error: unknown) {
    // `NotFoundError`: thrown by select queries when configured to throw on not found
    if (error instanceof NotFoundError) {
      return new NotFoundException(error.message)
    }

    // error 'P2001': no record found e.g. from update/delete query
    if (error instanceof PrismaClientKnownRequestError && error.code === PrismaQueryErrorCode.RecordDoesNotExist) {
      return new NotFoundException(error.message)
    }

    this._logger.error(error instanceof Error ? error.message : String(error))
    return error
  }

  async findAll(): Promise<RES_DTO[]> {
    const items = await this._modelDelegate.findMany({
      ...(this._options?.delegateSelectClause ? { select: this._options.delegateSelectClause } : {}),
    })

    return items.map((item) => new this._ResponseDtoClass(item) as RES_DTO)
  }

  async findAllByUser(user: AuthUser): Promise<RES_DTO[]> {
    const items = await this._modelDelegate.findMany({
      ...(this._options?.delegateSelectClause ? { select: this._options.delegateSelectClause } : {}),
      where: { user: { id: user.id } },
    })

    return items.map((item) => new this._ResponseDtoClass(item) as RES_DTO)
  }

  async findOne(identifier: string | number): Promise<RES_DTO | undefined> {
    const whereCondition = this.getIdentifierWhereCondition(identifier)

    const item = await this._modelDelegate.findFirst({
      ...(this._options?.delegateSelectClause ? { select: this._options.delegateSelectClause } : {}),
      where: whereCondition,
    })

    return item ? (new this._ResponseDtoClass(item) as RES_DTO) : undefined
  }

  async findOneByUser(user: AuthUser, identifier: string | number): Promise<RES_DTO | undefined> {
    const whereCondition = this.getIdentifierWhereCondition(identifier)

    const item = await this._modelDelegate.findFirst({
      ...(this._options?.delegateSelectClause ? { select: this._options.delegateSelectClause } : {}),
      where: { userId: user.id, ...whereCondition },
    })

    return item ? (new this._ResponseDtoClass(item) as RES_DTO) : undefined
  }

  async getOne(identifier: string | number): Promise<RES_DTO> {
    try {
      const condition = this.getIdentifierWhereCondition(identifier)
      const item = await this._modelDelegate.findUniqueOrThrow({
        ...(this._options?.delegateSelectClause ? { select: this._options.delegateSelectClause } : {}),
        where: condition,
      })

      return new this._ResponseDtoClass(item) as RES_DTO
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async getOneByUser(user: AuthUser, identifier: string | number): Promise<RES_DTO> {
    try {
      const whereCondition = this.getIdentifierWhereCondition(identifier)

      const item = await this._modelDelegate.findFirstOrThrow({
        ...(this._options?.delegateSelectClause ? { select: this._options.delegateSelectClause } : {}),
        where: { userId: user.id, ...whereCondition },
      })

      return new this._ResponseDtoClass(item) as RES_DTO
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async update(identifier: string | number, dto: U_DTO): Promise<RES_DTO> {
    const whereCondition = this.getIdentifierWhereCondition(identifier)

    // unsure of best way to type this.. one attempt/approach (requires 'any' on the base model delegate type)
    const item: Awaited<ReturnType<typeof this._modelDelegate['update']>> = await this._modelDelegate.update({
      ...(this._options?.delegateSelectClause ? { select: this._options.delegateSelectClause } : {}),
      where: whereCondition,
      data: {
        ...dto,
      },
    })

    return new this._ResponseDtoClass(item)
  }

  async createByUser(user: AuthUser, dto: C_DTO): Promise<RES_DTO> {
    // @todo catch unique constraint violation for videos create
    // @todo catch if user incorrect - createByUser
    const item = await this._modelDelegate.create({
      ...(this._options?.delegateSelectClause ? { select: this._options.delegateSelectClause } : {}),
      data: {
        ...dto,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    return new this._ResponseDtoClass(item)
  }

  async updateByUser(user: AuthUser, identifier: string | number, dto: U_DTO): Promise<RES_DTO> {
    const whereCondition = this.getIdentifierWhereCondition(identifier)

    const item: Awaited<ReturnType<typeof this._modelDelegate['update']>> = await this._modelDelegate.update({
      ...(this._options?.delegateSelectClause ? { select: this._options.delegateSelectClause } : {}),
      where: { userId: user.id, ...whereCondition },
      data: {
        ...dto,
      },
    })

    return new this._ResponseDtoClass(item)
  }

  async delete(identifier: string | number): Promise<void> {
    const whereCondition = this.getIdentifierWhereCondition(identifier)

    await this._modelDelegate.delete({
      where: whereCondition,
    })
  }

  async deleteByUser(user: AuthUser, identifier: string | number): Promise<void> {
    const owner = await this.findOneByUser(user, identifier)

    if (!owner) {
      throw new NotFoundException()
    }

    const whereCondition = this.getIdentifierWhereCondition(identifier)

    await this._modelDelegate.delete({
      where: whereCondition,
    })

    // works but unsure of best way to handle if user doesn't have associated ('connected') record (need to return 404)
    // @todo what type of error is it - The records for relation `UserToVideo` between the `User` and `Video` models are not connected.
    // (when deleting a non-existant video) -- @todo catch and return 404
    //
    // await this.prisma.user.update({
    //   where: {
    //     id: user.id,
    //   },
    //   data: {
    //     videos: {
    //       delete: condition,
    //     },
    //   },
    // })

    return
  }
}
