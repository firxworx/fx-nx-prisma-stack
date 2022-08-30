import { BadRequestException, forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import type { AuthUser } from '../auth/types/auth-user.type'
import { PrismaModelCrudService } from '../prisma/prisma-model-crud.abstract.service'
import { PrismaService } from '../prisma/prisma.service'
import { CreateVideoGroupDto } from './dto/create-video-group.dto'
import { UpdateVideoGroupDto } from './dto/update-video-group.dto'
import { VideoGroupDto } from './dto/video-group.dto'
import { videoGroupDtoPrismaOrderByClause, videoGroupDtoPrismaSelectClause } from './prisma/queries'
import { VideosService } from './videos.service'

type PrismaVideoGroupDelegate = Prisma.VideoGroupDelegate<
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
>

@Injectable()
export class VideoGroupsService extends PrismaModelCrudService<
  PrismaVideoGroupDelegate,
  VideoGroupDto,
  CreateVideoGroupDto,
  UpdateVideoGroupDto
> {
  private logger = new Logger(this.constructor.name)

  // private ERROR_MESSAGES = {
  //   INTERNAL_SERVER_ERROR: 'Server Error',
  // }

  constructor(
    private readonly prisma: PrismaService,
    // private readonly prismaHelperService: PrismaHelperService,

    @Inject(forwardRef(() => VideosService))
    private videosService: VideosService,
  ) {
    super(prisma.videoGroup, VideoGroupDto, CreateVideoGroupDto, UpdateVideoGroupDto, {
      delegateSelectClause: videoGroupDtoPrismaSelectClause,
      delegateOrderByClause: videoGroupDtoPrismaOrderByClause,
    })
  }

  async findAllByUserAndUuids(user: AuthUser, videoGroupUuids: string[]): Promise<VideoGroupDto[]> {
    const videoGroups = await this.prisma.videoGroup.findMany({
      where: {
        user: {
          id: user.id,
        },
        uuid: {
          in: videoGroupUuids,
        },
      },
    })

    return videoGroups.map((videoGroup) => new VideoGroupDto(videoGroup))
  }

  async verifyUserOwnershipOrThrow(user: AuthUser, videoGroupUuids: string[]): Promise<true> {
    const videoGroups = await this.findAllByUserAndUuids(user, videoGroupUuids)

    if (videoGroups.length !== videoGroupUuids?.length) {
      throw new BadRequestException('Invalid video groups')
    }

    return true
  }

  async createByUser(user: AuthUser, dto: CreateVideoGroupDto): Promise<VideoGroupDto> {
    const { videos: videoUuids, ...restDto } = dto

    // verify the user owns the videos that the new video group should be associated with
    // @todo confirm if this can be more elegantly handled with prisma e.g. implicitly in one query w/ exception handling for response type
    if (videoUuids) {
      await this.videosService.verifyUserOwnershipOrThrow(user, videoUuids)
    }

    // @todo catch unique constraint violation for video groups create
    const videoGroup = await this.prisma.videoGroup.create({
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

    return new VideoGroupDto(videoGroup)
  }

  async updateByUser(user: AuthUser, identifier: string | number, dto: UpdateVideoGroupDto): Promise<VideoGroupDto> {
    const videoWhereCondition = this.getIdentifierWhereCondition(identifier)
    const { videos: videoUuids, ...restDto } = dto

    // verify the user owns the videos that the new video group should be associated with
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

    return new VideoGroupDto(videoGroup)
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
    const videoGroupWhereCondition = this.getIdentifierWhereCondition(identifier)

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
      where: videoGroupWhereCondition,
    })

    await this.prisma.$transaction([deleteVideoGroupVideos, deleteVideoGroup])
    return
  }
}
