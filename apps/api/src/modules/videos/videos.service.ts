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

import type { AuthUser } from '../auth/types/auth-user.type'

import { PrismaHelperService } from '../prisma/prisma-helper.service'
import { PrismaService } from '../prisma/prisma.service'
import { CreateVideoDto } from './dto/create-video.dto'
import { UpdateVideoDto } from './dto/update-video.dto'
import { videoDtoPrismaSelectClause } from './prisma/queries'
import { VideoGroupsService } from './video-groups.service'
import { VideoDto } from './dto/video.dto'

@Injectable()
export class VideosService {
  private logger = new Logger(this.constructor.name)

  private ERROR_MESSAGES = {
    INTERNAL_SERVER_ERROR: 'Server Error',
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly prismaHelperService: PrismaHelperService,

    @Inject(forwardRef(() => VideoGroupsService))
    private videoGroupsService: VideoGroupsService,
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

  async findAll(): Promise<VideoDto[]> {
    const videos = await this.prisma.video.findMany({
      select: videoDtoPrismaSelectClause,
    })

    return videos.map((video) => new VideoDto(video))
  }

  // revised in experiment w/ response DTO + serializer interceptor + class transformer
  async findAllByUser(userId: number): Promise<VideoDto[]> {
    const videos = await this.prisma.video.findMany({
      select: videoDtoPrismaSelectClause,
      where: { user: { id: userId } },
    })

    return videos.map((video) => new VideoDto(video))
  }

  async findAllByUserAndUuids(user: AuthUser, videoUuids: string[]): Promise<VideoDto[]> {
    const videos = await this.prisma.video.findMany({
      where: {
        user: {
          id: user.id,
        },
        uuid: {
          in: videoUuids,
        },
      },
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

  async findOne(identifier: string | number): Promise<VideoDto | undefined> {
    const condition = this.getIdentifierCondition(identifier)

    const video = await this.prisma.video.findFirst({
      select: videoDtoPrismaSelectClause,
      where: condition,
    })

    return video ? new VideoDto(video) : undefined
  }

  async findOneByUser(user: AuthUser, identifier: string | number): Promise<VideoDto | undefined> {
    const condition = this.getIdentifierCondition(identifier)

    const video = await this.prisma.video.findFirst({
      select: videoDtoPrismaSelectClause,
      where: { userId: user.id, ...condition },
    })

    return video ? new VideoDto(video) : undefined
  }

  async getOne(identifier: string | number): Promise<VideoDto> {
    try {
      const condition = this.getIdentifierCondition(identifier)
      const video = await this.prisma.video.findUniqueOrThrow({
        select: videoDtoPrismaSelectClause,
        where: condition,
      })

      return new VideoDto(video)
    } catch (error: unknown) {
      throw this.prismaHelperService.handleError(error)
    }
  }

  async getOneByUser(user: AuthUser, identifier: string | number): Promise<VideoDto> {
    try {
      const condition = this.getIdentifierCondition(identifier)

      const video = await this.prisma.video.findFirstOrThrow({
        select: videoDtoPrismaSelectClause,
        where: { userId: user.id, ...condition },
      })

      return new VideoDto(video)
    } catch (error: unknown) {
      throw this.prismaHelperService.handleError(error)
    }
  }

  // @todo revise to return only the required response fields (VideoResponse)
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
    const videoWhereCondition = this.getIdentifierCondition(identifier)
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

  async deleteByUser(user: AuthUser, identifier: string | number): Promise<void> {
    const videoWhereCondition = this.getIdentifierCondition(identifier)

    const owner = await this.findOneByUser(user, identifier)
    if (!owner) {
      throw new NotFoundException(`Video not found: ${identifier}`)
    }

    await this.prisma.video.delete({
      where: videoWhereCondition,
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
