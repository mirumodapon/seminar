import { readFile, unlink } from 'node:fs/promises'
import { extname } from 'node:path'
import { BadRequestException, Body, ConflictException, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { fromBuffer } from 'file-type'
import { diskStorage } from 'multer'
import { ActivityService } from './activity.service'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) { }

  @Get()
  findAll() {
    return this.activityService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const activity = await this.activityService.findOne(id)

    if (!activity) {
      throw new NotFoundException('找不到這個活動 RR')
    }

    return activity
  }

  @Post()
  async create(@Body() body: CreateActivityDto) {
    const exists = await this.activityService.findOne(body.activityId)

    if (exists) {
      throw new ConflictException('這個活動已經存在了')
    }

    return this.activityService.create(body)
  }

  @Post(':id')
  async recover(@Param('id') id: string) {
    const activity = await this.activityService.recover(id)

    if (!activity) {
      throw new NotFoundException('找不到這個活動 RR')
    }

    return activity
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto) {
    const activity = await this.activityService.update(id, updateActivityDto)

    if (!activity) {
      throw new NotFoundException('找不到這個活動 RR')
    }

    return activity
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    const affect = await this.activityService.remove(id)

    if (affect === 0) {
      throw new NotFoundException('找不到這個活動 RR')
    }
  }

  @Post(':id/ogImage')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/ogImage',
      filename: (_, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`)
      },
    }),
  }))
  async uploadOgImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('沒有上傳檔案')
    }

    const buffer = await readFile(file.path)
    const fileTypeResult = await fromBuffer(buffer)

    try {
      const activity = await this.activityService.findOne(id)

      if (!activity) {
        throw new NotFoundException('找不到這個活動 RR')
      }

      if (!fileTypeResult || !fileTypeResult.mime.startsWith('image/')) {
        throw new BadRequestException('只能上傳圖片檔案')
      }

      if (activity.ogImage) {
        await unlink(`./uploads/ogImage/${activity.ogImage}`)
      }
    }
    catch (error) {
      await unlink(file.path)
      throw error
    }

    const updatedActivity = await this.activityService.update(id, { ogImage: file.filename })

    return updatedActivity
  }

  @Post(':id/banner')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/banner',
      filename: (_, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`)
      },
    }),
  }))
  async uploadBanner(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('沒有上傳檔案')
    }

    const buffer = await readFile(file.path)
    const fileTypeResult = await fromBuffer(buffer)

    try {
      const activity = await this.activityService.findOne(id)

      if (!activity) {
        throw new NotFoundException('找不到這個活動 RR')
      }

      if (!fileTypeResult || !fileTypeResult.mime.startsWith('image/')) {
        throw new BadRequestException('只能上傳圖片檔案')
      }

      if (activity.banner) {
        await unlink(`./uploads/banner/${activity.banner}`)
      }
    }
    catch (error) {
      await unlink(file.path)
      throw error
    }

    const updatedActivity = await this.activityService.update(id, { banner: file.filename })

    return updatedActivity
  }
}
