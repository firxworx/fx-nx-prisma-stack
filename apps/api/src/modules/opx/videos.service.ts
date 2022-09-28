import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'

import type { AuthUser } from '../auth/types/auth-user.type'
import { PrismaService } from '../prisma/prisma.service'
import { CreateVideoDto } from './dto/create-video.dto'
import { UpdateVideoDto } from './dto/update-video.dto'
import { videoDtoPrismaOrderByClause, videoDtoPrismaSelectClause } from './prisma/queries'
import { VideoGroupsService } from './video-groups.service'
import { VideoDto } from './dto/video.dto'
import { PrismaUtilsService } from '../prisma/prisma-utils.service'

@Injectable()
export class VideosService {
  private logger = new Logger(this.constructor.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaUtilsService: PrismaUtilsService,

    @Inject(forwardRef(() => VideoGroupsService))
    private readonly videoGroupsService: VideoGroupsService,
  ) {}

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

  async findAllByUserAndUuids(user: AuthUser, boxProfileUuid: string, videoUuids: string[]): Promise<VideoDto[]> {
    const videos = await this.prisma.video.findMany({
      select: videoDtoPrismaSelectClause,
      where: {
        boxProfile: {
          uuid: boxProfileUuid,
          user: {
            id: user.id,
          },
        },
        uuid: {
          in: videoUuids,
        },
      },
      orderBy: videoDtoPrismaOrderByClause,
    })

    return videos.map((video) => new VideoDto(video))
  }

  async verifyUserAndBoxProfileOwnershipOrThrow(
    user: AuthUser,
    boxProfileUuid: string,
    videoUuids: string[],
  ): Promise<true> {
    const videos = await this.findAllByUserAndUuids(user, boxProfileUuid, videoUuids)

    if (videos.length !== videoUuids?.length) {
      throw new BadRequestException('Invalid videos')
    }

    return true
  }

  async findAllByUserAndBoxProfile(user: AuthUser, boxProfileUuid: string): Promise<VideoDto[]> {
    const items = await this.prisma.video.findMany({
      select: videoDtoPrismaSelectClause,
      where: {
        boxProfile: {
          uuid: boxProfileUuid,
          user: {
            id: user.id,
          },
        },
      },
      orderBy: videoDtoPrismaOrderByClause,
    })

    return items.map((item) => new VideoDto(item))
  }

  async getOneByUserAndBoxProfile(
    user: AuthUser,
    boxProfileUuid: string,
    identifier: string | number,
  ): Promise<VideoDto> {
    const whereCondition = this.getIdentifierWhereCondition(identifier)

    try {
      const item = await this.prisma.video.findFirstOrThrow({
        select: videoDtoPrismaSelectClause,
        where: {
          boxProfile: {
            uuid: boxProfileUuid,
            user: {
              id: user.id,
            },
          },
          ...whereCondition,
        },
      })

      return new VideoDto(item)
    } catch (error: unknown) {
      throw this.prismaUtilsService.processError(error)
    }
  }

  async createByUser(user: AuthUser, boxProfileUuid: string, dto: CreateVideoDto): Promise<VideoDto> {
    const { groups: videoGroupUuids, ...restDto } = dto

    // verify the user owns the video groups that the new video should be associated with
    // @todo confirm if this can be more elegantly handled with prisma e.g. implicitly in one query w/ exception handling for response type
    if (videoGroupUuids) {
      await this.videoGroupsService.verifyUserAndBoxProfileOwnershipOrThrow(user, boxProfileUuid, videoGroupUuids)
    }

    // @todo catch unique constraint violation for videos create
    const video = await this.prisma.video.create({
      select: videoDtoPrismaSelectClause,
      data: {
        ...restDto,
        boxProfile: {
          connect: {
            uuid: boxProfileUuid,
          },
        },
        groups: {
          create: videoGroupUuids?.map((uuid) => ({
            videoGroup: {
              connect: {
                uuid,
              },
            },
          })),
        },
      },
    })

    return new VideoDto(video)
  }

  async updateByUser(
    user: AuthUser,
    boxProfileUuid: string,
    identifier: string | number,
    dto: UpdateVideoDto,
  ): Promise<VideoDto> {
    const videoWhereCondition = this.getIdentifierWhereCondition(identifier)
    const { groups: videoGroupUuids, ...restDto } = dto

    // verify the user owns the video groups that the new video should be associated with
    // @todo confirm if this can be more elegantly handled with prisma e.g. implicitly in one query w/ exception handling for response type
    if (videoGroupUuids) {
      await this.videoGroupsService.verifyUserAndBoxProfileOwnershipOrThrow(user, boxProfileUuid, videoGroupUuids)
    }

    const video = await this.prisma.video.update({
      select: videoDtoPrismaSelectClause,
      where: videoWhereCondition,
      data: {
        ...restDto,
        boxProfile: {
          connect: {
            uuid: boxProfileUuid,
          },
        },
        ...(videoGroupUuids
          ? {
              groups: {
                deleteMany: {},
                create: videoGroupUuids?.map((uuid) => ({
                  videoGroup: {
                    connect: {
                      uuid,
                    },
                  },
                })),
              },
            }
          : {}),
      },
    })

    return new VideoDto(video)
  }

  async deleteByUserAndBoxProfile(user: AuthUser, boxProfileUuid: string, identifier: string | number): Promise<void> {
    await this.getOneByUserAndBoxProfile(user, boxProfileUuid, identifier) // throws on not found

    const whereCondition = this.getIdentifierWhereCondition(identifier)

    await this.prisma.video.delete({
      where: whereCondition,
    })

    return
  }
}
