import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common'
import { Prisma, PrismaPromise } from '@prisma/client'
import { AuthUser } from '../auth/types/auth-user.type'

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
  update(data: unknown): PrismaPromise<unknown>
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
 * @todo create and update (PrismaModelCrudService)
 *
 * @see {@link https://docs.nestjs.com/recipes/prisma}
 * @see {@link https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-nestjs/src}
 */
@Injectable()
export abstract class PrismaModelCrudService<D extends PrismaDelegate, DTO> {
  private readonly _logger = new Logger(this.constructor.name)

  private _ERROR_MESSAGES = {
    INTERNAL_SERVER_ERROR: 'Server Error',
  }

  protected _modelDelegate: D
  protected _DtoClass: ConstructorType<DTO>
  protected _options?: { delegateSelectClause?: Record<string, unknown> }

  protected constructor(
    modelDelegate: D,
    DtoClass: ConstructorType<DTO>,
    options?: { delegateSelectClause?: Record<string, unknown> },
  ) {
    this._modelDelegate = modelDelegate
    this._DtoClass = DtoClass
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

  async findAll(): Promise<DTO[]> {
    const items = await this._modelDelegate.findMany({
      ...(this._options?.delegateSelectClause ? { select: this._options.delegateSelectClause } : {}),
    })

    return items.map((item) => new this._DtoClass(item) as DTO)
  }

  async findAllByUser(user: AuthUser): Promise<DTO[]> {
    const items = await this._modelDelegate.findMany({
      ...(this._options?.delegateSelectClause ? { select: this._options.delegateSelectClause } : {}),
      where: { user: { id: user.id } },
    })

    return items.map((item) => new this._DtoClass(item) as DTO)
  }

  async findOne(identifier: string | number): Promise<DTO | undefined> {
    const whereCondition = this.getIdentifierWhereCondition(identifier)

    const item = await this._modelDelegate.findFirst({
      ...(this._options?.delegateSelectClause ? { select: this._options.delegateSelectClause } : {}),
      where: whereCondition,
    })

    return item ? (new this._DtoClass(item) as DTO) : undefined
  }

  async findOneByUser(user: AuthUser, identifier: string | number): Promise<DTO | undefined> {
    const condition = this.getIdentifierWhereCondition(identifier)

    const item = await this._modelDelegate.findFirst({
      ...(this._options?.delegateSelectClause ? { select: this._options.delegateSelectClause } : {}),
      where: { userId: user.id, ...condition },
    })

    return item ? (new this._DtoClass(item) as DTO) : undefined
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
