import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { VideoGroup } from '@prisma/client'

import type { AuthUser } from '../auth/types/auth-user.type'
import { PrismaHelperService } from '../prisma/prisma-helper.service'
import { PrismaService } from '../prisma/prisma.service'
import { CreateVideoGroupDto } from './dto/create-video-group.dto'
import { UpdateVideoGroupDto } from './dto/update-video-group.dto'
import { videoGroupDtoPrismaSelectClause } from './prisma/queries'
import { PrismaVideoGroupQueryResult } from './types/queries.types'
import { VideoGroupResponse } from './types/response.types'
import { VideosService } from './videos.service'

@Injectable()
export class VideoGroupsService {
  private logger = new Logger(this.constructor.name)

  private ERROR_MESSAGES = {
    INTERNAL_SERVER_ERROR: 'Server Error',
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly prismaHelperService: PrismaHelperService,

    @Inject(forwardRef(() => VideosService))
    private videosService: VideosService,
  ) {}

  private getIdentifierCondition(identifier: string | number): { uuid: string } | { id: number } {
    switch (typeof identifier) {
      case 'string': {
        return { uuid: identifier }
      }
      case 'number': {
        return { id: identifier }
      }
      default: {
        this.logger.log(`Invalid data identifier encountered at runtime: ${identifier}`)
        throw new InternalServerErrorException(this.ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
      }
    }
  }

  /**
   * Flatten prisma query result to omit redundant `videoGroup` object hierarchy and return an array of
   * cleaner `VideoDto` objects.
   */
  private flattenNestedVideos<T extends PrismaVideoGroupQueryResult>(input: T): VideoGroupResponse
  private flattenNestedVideos<T extends PrismaVideoGroupQueryResult[]>(input: T): VideoGroupResponse[]
  private flattenNestedVideos<T extends PrismaVideoGroupQueryResult | PrismaVideoGroupQueryResult[]>(
    input: T,
  ): VideoGroupResponse | VideoGroupResponse[] {
    if (Array.isArray(input)) {
      return input.map((videoGroup) => {
        return {
          ...videoGroup,
          videos: videoGroup.videos.map((v) => ({ ...v.video })),
        }
      })
    }

    return {
      ...input,
      videos: input.videos.map((v) => ({ ...v.video })),
    }
  }

  async findAll() {
    return this.prisma.videoGroup.findMany({
      select: videoGroupDtoPrismaSelectClause,
    })
  }

  async findAllByUser(user: AuthUser) {
    return this.prisma.videoGroup.findMany({
      select: videoGroupDtoPrismaSelectClause,
      where: { user: { id: user.id } },
    })
  }

  async findAllByUserAndUuids(user: AuthUser, videoGroupUuids: string[]): Promise<VideoGroup[]> {
    return this.prisma.videoGroup.findMany({
      where: {
        user: {
          id: user.id,
        },
        uuid: {
          in: videoGroupUuids,
        },
      },
    })
  }

  async verifyUserOwnershipOrThrow(user: AuthUser, videoGroupUuids: string[]): Promise<true> {
    const videoGroups = await this.findAllByUserAndUuids(user, videoGroupUuids)

    if (videoGroups.length !== videoGroupUuids?.length) {
      throw new BadRequestException('Invalid video groups')
    }

    return true
  }

  async findOne(identifier: string | number) {
    const condition = this.getIdentifierCondition(identifier)

    const videoGroup = await this.prisma.videoGroup.findFirst({
      select: videoGroupDtoPrismaSelectClause,
      where: condition,
    })

    return videoGroup === null ? undefined : this.flattenNestedVideos(videoGroup)
  }

  async findOneByUser(user: AuthUser, identifier: string | number): Promise<VideoGroupResponse | undefined> {
    const condition = this.getIdentifierCondition(identifier)

    const videoGroup = await this.prisma.videoGroup.findFirst({
      select: videoGroupDtoPrismaSelectClause,
      where: { userId: user.id, ...condition },
    })

    return videoGroup ? this.flattenNestedVideos(videoGroup) : undefined
  }

  async getOneByUser(user: AuthUser, identifier: string | number): Promise<VideoGroupResponse> {
    try {
      const condition = this.getIdentifierCondition(identifier)

      const videoGroup = await this.prisma.videoGroup.findFirstOrThrow({
        select: videoGroupDtoPrismaSelectClause,
        where: { userId: user.id, ...condition },
      })

      return this.flattenNestedVideos(videoGroup)
    } catch (error: unknown) {
      throw this.prismaHelperService.handleError(error)
    }
  }

  async createByUser(user: AuthUser, dto: CreateVideoGroupDto) {
    const { videos: videoUuids, ...restDto } = dto

    // @todo handle adding/updating videos to group (must belong to same user) - need verifyUserOwnershipOrThrow() or let schema handle?
    // @todo catch unique constraint violation for video groups create

    return this.prisma.videoGroup.create({
      select: videoGroupDtoPrismaSelectClause,
      data: {
        ...restDto,
        user: {
          connect: {
            id: user.id,
          },
        },
        videos: {
          create: videoUuids?.map((uuid) => ({
            video: {
              connect: {
                uuid,
              },
            },
          })),
        },
      },
    })
  }

  async updateByUser(user: AuthUser, identifier: string | number, dto: UpdateVideoGroupDto) {
    const videoWhereCondition = this.getIdentifierCondition(identifier)
    const { videos: videoUuids, ...restDto } = dto

    if (videoUuids) {
      await this.videosService.verifyUserOwnershipOrThrow(user, videoUuids)
    }

    const videoGroup = await this.prisma.videoGroup.update({
      select: videoGroupDtoPrismaSelectClause,
      where: videoWhereCondition,
      data: {
        ...restDto,
        user: {
          connect: { id: user.id },
        },
        ...(videoUuids
          ? {
              videos: {
                deleteMany: {},
                create: videoUuids?.map((uuid) => ({
                  video: {
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

    return this.flattenNestedVideos(videoGroup)
  }

  async delete(videoGroupId: number): Promise<void> {
    const deleteVideoGroupVideos = this.prisma.videoGroupsOnVideos.deleteMany({
      where: {
        videoGroupId,
      },
    })

    const deleteVideoGroup = this.prisma.videoGroup.delete({
      where: {
        id: videoGroupId,
      },
    })

    await this.prisma.$transaction([deleteVideoGroupVideos, deleteVideoGroup])
    return
  }

  async deleteByUser(user: AuthUser, identifier: string | number): Promise<void> {
    const videoGroupWhereCondition = this.getIdentifierCondition(identifier)

    const owner = await this.findOneByUser(user, identifier)
    if (!owner) {
      throw new NotFoundException(`Video Group not found: ${identifier}`)
    }

    await this.prisma.videoGroup.delete({
      where: videoGroupWhereCondition,
    })

    const deleteVideoGroupVideos = this.prisma.videoGroupsOnVideos.deleteMany({
      where: {
        videoGroup: {
          userId: user.id,
          ...videoGroupWhereCondition,
        },
      },
    })

    const deleteVideoGroup = this.prisma.videoGroup.delete({
      include: {
        user: true,
      },
      where: {
        ...videoGroupWhereCondition,
      },
    })

    //   await this.prisma.user.update({
    //     where: {
    //       id: userId,
    //     },
    //     data: {
    //       videoGroups: {
    //         deleteMany: condition, // confirm cascade deletes the videoGroupVideos associations
    //       },
    //     },
    //   })

    await this.prisma.$transaction([deleteVideoGroupVideos, deleteVideoGroup])
    return
  }
}
