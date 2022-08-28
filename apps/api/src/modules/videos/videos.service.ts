import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'

import { Prisma } from '@prisma/client'
import { PrismaModelCrudService } from '../prisma/prisma-model-crud.abstract.service'

import type { AuthUser } from '../auth/types/auth-user.type'
import { PrismaService } from '../prisma/prisma.service'
import { CreateVideoDto } from './dto/create-video.dto'
import { UpdateVideoDto } from './dto/update-video.dto'
import { videoDtoPrismaOrderByClause, videoDtoPrismaSelectClause } from './prisma/queries'
import { VideoGroupsService } from './video-groups.service'
import { VideoDto } from './dto/video.dto'

type PrismaVideoDelegate = Prisma.VideoDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>

@Injectable()
export class VideosService extends PrismaModelCrudService<
  PrismaVideoDelegate,
  VideoDto,
  CreateVideoDto,
  UpdateVideoDto
> {
  constructor(
    private readonly prisma: PrismaService,

    @Inject(forwardRef(() => VideoGroupsService))
    private videoGroupsService: VideoGroupsService,
  ) {
    super(prisma.video, VideoDto, CreateVideoDto, UpdateVideoDto, {
      delegateSelectClause: videoDtoPrismaSelectClause,
      delegateOrderByClause: videoDtoPrismaOrderByClause,
    })
  }

  async findAllByUserAndUuids(user: AuthUser, videoUuids: string[]): Promise<VideoDto[]> {
    const videos = await this.prisma.video.findMany({
      select: videoDtoPrismaSelectClause,
      where: {
        user: {
          id: user.id,
        },
        uuid: {
          in: videoUuids,
        },
      },
      orderBy: videoDtoPrismaOrderByClause,
    })

    return videos.map((video) => new VideoDto(video))
  }

  async verifyUserOwnershipOrThrow(user: AuthUser, videoUuids: string[]): Promise<true> {
    const videos = await this.findAllByUserAndUuids(user, videoUuids)

    if (videos.length !== videoUuids?.length) {
      throw new BadRequestException('Invalid videos')
    }

    return true
  }

  async createByUser(user: AuthUser, dto: CreateVideoDto): Promise<VideoDto> {
    const { groups: videoGroupUuids, ...restDto } = dto

    // verify the user owns the video groups that the new video should be associated with
    // @todo confirm if this can be more elegantly handled with prisma e.g. implicitly in one query w/ exception handling for response type
    if (videoGroupUuids) {
      await this.videoGroupsService.verifyUserOwnershipOrThrow(user, videoGroupUuids)
    }

    // @todo catch unique constraint violation for videos create
    const video = await this.prisma.video.create({
      select: videoDtoPrismaSelectClause,
      data: {
        ...restDto,
        user: {
          connect: {
            id: user.id,
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

  async updateByUser(user: AuthUser, identifier: string | number, dto: UpdateVideoDto): Promise<VideoDto> {
    const videoWhereCondition = this.getIdentifierWhereCondition(identifier)
    const { groups: videoGroupUuids, ...restDto } = dto

    // verify the user owns the video groups that the new video should be associated with
    // @todo confirm if this can be more elegantly handled with prisma e.g. implicitly in one query w/ exception handling for response type
    if (videoGroupUuids) {
      await this.videoGroupsService.verifyUserOwnershipOrThrow(user, videoGroupUuids)
    }

    const video = await this.prisma.video.update({
      select: videoDtoPrismaSelectClause,
      where: videoWhereCondition,
      data: {
        ...restDto,
        user: {
          connect: { id: user.id },
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
}
