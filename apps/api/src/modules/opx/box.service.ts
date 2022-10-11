import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { nanoid } from 'nanoid/async'

import type { AuthUser } from '../auth/types/auth-user.type'
import { PrismaService } from '../prisma/prisma.service'
import { BoxProfileDto } from './dto/box-profile.dto'
import { CreateBoxProfileDto } from './dto/create-box-profile.dto'
import { UpdateBoxProfileDto } from './dto/update-box-profile.dto'

/*
 * note: running w/ nanoid nanoid@^3.0.0 until nx has more elegant built-in support for esm
 *       @see https://github.com/nrwl/nx/pull/10414
 */

@Injectable()
export class BoxService {
  private logger = new Logger(this.constructor.name)

  public BOX_PROFILE_PUBLIC_FIELDS = [
    'uuid',
    'createdAt',
    'updatedAt',
    'name',
    'urlCode',
    'videos',
    'videoGroups',
  ] as const

  constructor(private readonly prisma: PrismaService) {}

  private getIdentifierWhereCondition(identifier: string | number): { uuid: string } | { id: number } {
    switch (typeof identifier) {
      case 'string': {
        return { uuid: identifier }
      }
      case 'number': {
        return { id: identifier }
      }
      default: {
        this.logger.error(`Unexpected invalid data identifier at runtime: ${identifier}`)
        throw new InternalServerErrorException('Server Error')
      }
    }
  }

  private getBoxProfileDtoSelectClause(): Record<string, true> {
    // @temp
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.BOX_PROFILE_PUBLIC_FIELDS.reduce((acc, fieldName) => ({ ...acc, [fieldName]: true }), {} as any)
  }

  // videoGroupPrismaSelectFields: BoxProfileModelPrismaSelectFields = Prisma.validator<Prisma.BoxProfileSelect>()(
  //   VIDEO_GROUP_MODEL_PUBLIC_FIELDS.reduce(
  //     (acc, fieldName) => ({ ...acc, [fieldName]: true }),
  //     {} as VideoGroupModelPrismaSelectFields,
  //   ),
  // )

  // videoDtoPrismaSelectClause: VideoDtoPrismaSelectClause = {
  //   ...videoPrismaSelectFields,
  //   groups: { select: { videoGroup: { select: videoGroupPrismaSelectFields } } },
  // }

  async findAllByUser(user: AuthUser): Promise<BoxProfileDto[]> {
    const boxProfiles = await this.prisma.boxProfile.findMany({
      select: this.getBoxProfileDtoSelectClause(),
      where: {
        user: {
          id: user.id,
        },
      },
      // orderBy: ...,
    })

    return boxProfiles.map((boxProfile) => new BoxProfileDto(boxProfile))
  }

  async getOneByUser(user: AuthUser, identifier: string | number): Promise<BoxProfileDto> {
    const whereCondition = this.getIdentifierWhereCondition(identifier)

    const item = await this.prisma.boxProfile.findFirstOrThrow({
      select: this.getBoxProfileDtoSelectClause(),
      where: {
        user: {
          id: user.id,
        },
        ...whereCondition,
      },
    })

    return new BoxProfileDto(item)
  }

  async createByUser(user: AuthUser, dto: CreateBoxProfileDto): Promise<BoxProfileDto> {
    // @todo shorten box profile id's (nanoid?) and add + handle unique constraint violation
    const urlCode = await nanoid(10)

    const boxProfile = await this.prisma.boxProfile.create({
      select: this.getBoxProfileDtoSelectClause(),
      data: {
        ...dto,
        urlCode,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    return new BoxProfileDto(boxProfile)
  }

  async updateByUser(user: AuthUser, identifier: string | number, dto: UpdateBoxProfileDto): Promise<BoxProfileDto> {
    const whereCondition = this.getIdentifierWhereCondition(identifier)

    const boxProfile = await this.prisma.boxProfile.update({
      select: this.getBoxProfileDtoSelectClause(),
      where: whereCondition,
      data: {
        ...dto,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    return new BoxProfileDto(boxProfile)
  }

  async deleteByUser(user: AuthUser, identifier: string | number): Promise<void> {
    await this.getOneByUser(user, identifier) // throws on not found

    const whereCondition = this.getIdentifierWhereCondition(identifier)

    await this.prisma.boxProfile.delete({
      where: whereCondition,
    })

    return
  }
}
