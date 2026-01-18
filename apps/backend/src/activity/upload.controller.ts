import type { Express } from 'express'
import { randomUUID } from 'node:crypto'
import { Controller, HttpCode, HttpStatus, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { AdminGuard } from 'src/common/guard/role.guard'
import { ActivityService } from './activity.service'

@Controller('activity')
@UseGuards(AdminGuard)
export class UploadController {
  constructor(private readonly activityService: ActivityService) { }

  @Post(':id/upload/banner')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './static',
      filename: (_, __, cb) => {
        cb(null, randomUUID())
      },
    }),
  }))
  @HttpCode(HttpStatus.NO_CONTENT)
  uploadFileBanner(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.activityService.updateActivity(id, { banner: file.filename })
  }

  @Post(':id/upload/ogImage')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './static',
      filename: (_, __, cb) => {
        cb(null, randomUUID())
      },
    }),
  }))
  @HttpCode(HttpStatus.NO_CONTENT)
  uploadFileOgImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.activityService.updateActivity(id, { ogImage: file.filename })
  }

  @Post(':id/upload/logo')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './static',
      filename: (_, __, cb) => {
        cb(null, randomUUID())
      },
    }),
  }))
  @HttpCode(HttpStatus.NO_CONTENT)
  uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.activityService.updateActivity(id, { logo: file.filename })
  }
}
