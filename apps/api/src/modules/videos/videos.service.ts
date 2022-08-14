import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma, VideoGroup, type Video } from '@prisma/client'
import type { AuthUser } from '../auth/types/auth-user.type'
import { PrismaHelperService } from '../prisma/prisma-helper.service'
import { PrismaService } from '../prisma/prisma.service'
import { CreateVideoDto } from './dto/create-video.dto'
import { UpdateVideoDto } from './dto/update-video.dto'

const VIDEO_DTO_FIELDS = ['uuid', 'createdAt', 'updatedAt', 'name', 'platform', 'externalId'] as const
const VIDEO_GROUP_DTO_FIELDS = ['uuid', 'name', 'description'] as const

type VideoModelDtoField = typeof VIDEO_DTO_FIELDS[number]
type VideoGroupModelDtoField = typeof VIDEO_GROUP_DTO_FIELDS[number]
type VideoModelDto = Pick<Video, VideoModelDtoField>
type VideoGroupModelDto = Pick<VideoGroup, VideoGroupModelDtoField>

type VideoDto = VideoModelDto & { groups: VideoGroupModelDto[] }

type PrismaVideoQueryResult = VideoModelDto & { groups: { videoGroup: VideoGroupModelDto }[] }

@Injectable()
export class VideosService {
  private logger = new Logger(this.constructor.name)

  private ERROR_MESSAGES = {
    INTERNAL_SERVER_ERROR: 'Server Error',
  }

  private videoDtoFields: VideoModelDtoField[]
  private videoGroupDtoFields: VideoGroupModelDtoField[]
  private videoPrismaSelectFields: Record<keyof VideoModelDto, true>
  private videoGroupPrismaSelectFields: Record<keyof VideoGroupModelDto, true>

  private videoDtoPrismaSelectFields: Record<keyof VideoModelDto, true> & {
    groups: { select: { videoGroup: { select: Record<keyof VideoGroupModelDto, true> } } }
  }

  constructor(
    private readonly configService: ConfigService,
    private prisma: PrismaService,
    private prismaHelperService: PrismaHelperService,
  ) {
    this.videoDtoFields = [...VIDEO_DTO_FIELDS]
    this.videoGroupDtoFields = [...VIDEO_GROUP_DTO_FIELDS]

    // const selectFieldsReducer = <>() => {}

    this.videoPrismaSelectFields = Prisma.validator<Prisma.VideoSelect>()(
      this.videoDtoFields.reduce((acc, fieldName) => {
        return {
          ...acc,
          [fieldName]: true,
        }
      }, {} as typeof this.videoPrismaSelectFields),
    )

    this.videoGroupPrismaSelectFields = Prisma.validator<Prisma.VideoGroupSelect>()(
      this.videoGroupDtoFields.reduce(
        (acc, fieldName) => ({ ...acc, [fieldName]: true }),
        {} as typeof this.videoGroupPrismaSelectFields,
      ),
    )

    this.videoDtoPrismaSelectFields = {
      ...this.videoPrismaSelectFields,
      groups: { select: { videoGroup: { select: this.videoGroupPrismaSelectFields } } },
    }
  }

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
  private flattenNestedVideoGroups<T extends PrismaVideoQueryResult>(input: T): VideoDto
  private flattenNestedVideoGroups<T extends PrismaVideoQueryResult[]>(input: T): VideoDto[]
  private flattenNestedVideoGroups<T extends PrismaVideoQueryResult | PrismaVideoQueryResult[]>(
    input: T,
  ): VideoDto | VideoDto[] {
    if (Array.isArray(input)) {
      return input.map((video) => {
        return {
          ...video,
          groups: video.groups.map((vg) => ({ ...vg.videoGroup })),
        }
      })
    }

    return {
      ...input,
      groups: input.groups.map((vg) => ({ ...vg.videoGroup })),
    }
  }

  private async getUserVideoGroups(user: AuthUser, videoGroupUuids: string[]): Promise<VideoGroup[]> {
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

  private async verifyUserVideoGroupsOrThrow(user: AuthUser, videoGroupUuids: string[]): Promise<true> {
    const videoGroups = await this.getUserVideoGroups(user, videoGroupUuids)

    if (videoGroups.length !== videoGroupUuids?.length) {
      throw new BadRequestException('Invalid video groups')
    }

    return true
  }

  async findAll(): Promise<VideoDto[]> {
    const videos = await this.prisma.video.findMany({
      select: this.videoDtoPrismaSelectFields,
    })

    return this.flattenNestedVideoGroups(videos)
  }

  async findAllByUser(userId: number): Promise<VideoDto[]> {
    const videos = await this.prisma.video.findMany({
      select: this.videoDtoPrismaSelectFields,
      where: { user: { id: userId } },
    })

    return this.flattenNestedVideoGroups(videos)
  }

  async findOne(identifier: string | number): Promise<VideoDto | undefined> {
    const condition = this.getIdentifierCondition(identifier)

    const video = await this.prisma.video.findFirst({
      select: this.videoDtoPrismaSelectFields,
      where: condition,
    })

    return video === null ? undefined : this.flattenNestedVideoGroups(video)
  }

  async findOneByUser(user: AuthUser, identifier: string | number): Promise<VideoModelDto | undefined> {
    const condition = this.getIdentifierCondition(identifier)
    const video = await this.prisma.video.findFirst({
      select: this.videoDtoPrismaSelectFields,
      where: { userId: user.id, ...condition },
    })

    return video ?? undefined
  }

  async getOne(identifier: string | number): Promise<VideoDto> {
    try {
      const condition = this.getIdentifierCondition(identifier)
      const video = await this.prisma.video.findUniqueOrThrow({
        select: this.videoDtoPrismaSelectFields,
        where: condition,
      })

      return this.flattenNestedVideoGroups(video)
    } catch (error: unknown) {
      throw this.prismaHelperService.handleError(error)
    }
  }

  async getOneByUser(user: AuthUser, identifier: string | number): Promise<VideoDto> {
    try {
      const condition = this.getIdentifierCondition(identifier)
      const video = await this.prisma.video.findFirstOrThrow({
        select: this.videoDtoPrismaSelectFields,
        where: { userId: user.id, ...condition },
      })

      return this.flattenNestedVideoGroups(video)
    } catch (error: unknown) {
      throw this.prismaHelperService.handleError(error)
    }
  }

  async createByUser(user: AuthUser, dto: CreateVideoDto): Promise<Video> {
    const { groups: videoGroupUuids, ...restDto } = dto

    // verify the user owns the video groups that the new video should be associated with
    // @todo confirm if this can be more elegantly handled with prisma e.g. implicitly in one query w/ exception handling for response type
    if (videoGroupUuids) {
      await this.verifyUserVideoGroupsOrThrow(user, videoGroupUuids)
    }

    // @todo catch unique constraint violation
    return this.prisma.video.create({
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
  }

  async updateByUser(user: AuthUser, identifier: string | number, dto: UpdateVideoDto): Promise<VideoDto> {
    const videoWhereCondition = this.getIdentifierCondition(identifier)
    const { groups: videoGroupUuids, ...restDto } = dto

    // verify the user owns the video groups that the new video should be associated with
    // @todo confirm if this can be more elegantly handled with prisma e.g. implicitly in one query w/ exception handling for response type
    if (videoGroupUuids) {
      await this.verifyUserVideoGroupsOrThrow(user, videoGroupUuids)
    }

    const video = await this.prisma.video.update({
      select: this.videoDtoPrismaSelectFields,
      where: {
        ...videoWhereCondition,
      },
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

    return this.flattenNestedVideoGroups(video)
  }

  async deleteByUser(user: AuthUser, identifier: string | number): Promise<void> {
    const videoWhereCondition = this.getIdentifierCondition(identifier)

    const owner = await this.findOneByUser(user, identifier)

    if (!owner) {
      throw new NotFoundException(`Video not found: ${identifier}`)
    }

    await this.prisma.video.delete({
      where: {
        ...videoWhereCondition,
      },
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
