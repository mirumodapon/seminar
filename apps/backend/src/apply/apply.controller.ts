import type { Response } from 'express'
import { createReadStream } from 'node:fs'
import { readFile, stat, unlink } from 'node:fs/promises'
import { extname, join } from 'node:path'
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  Session,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { fromBuffer } from 'file-type'
import { diskStorage } from 'multer'
import { AdminGuard, UserGuard } from '../auth/guard'
import { ApplyService } from './apply.service'
import { AdminUpdateApplyDto } from './dto/admin-update-apply.dto'
import { CreateApplyDto } from './dto/create-apply.dto'
import { UpdateApplyDto } from './dto/update-apply.dto'

@Controller('apply')
export class ApplyController {
  constructor(private readonly applyService: ApplyService) { }

  // ── 使用者路由 ──────────────────────────────────────────────

  @Post()
  @UseGuards(UserGuard)
  create(@Body() body: CreateApplyDto, @Session() session: Record<string, any>) {
    return this.applyService.create(session.user.userId, body)
  }

  @Get('me')
  @UseGuards(UserGuard)
  findMine(@Session() session: Record<string, any>) {
    return this.applyService.findByUser(session.user.userId)
  }

  @Patch('me/:applyId')
  @UseGuards(UserGuard)
  async updateMine(
    @Param('applyId', ParseIntPipe) applyId: number,
    @Body() body: UpdateApplyDto,
    @Session() session: Record<string, any>,
  ) {
    const apply = await this.applyService.findOne(applyId)

    if (!apply) {
      throw new NotFoundException('找不到此投稿')
    }

    if (apply.userId !== session.user.userId) {
      throw new ForbiddenException('無法修改他人的投稿')
    }

    if (apply.status !== 'accepted') {
      delete apply.meal
      delete apply.attended
      delete apply.diningHibits
    }

    return this.applyService.update(applyId, body)
  }

  @Post('me/:applyId/slides')
  @UseGuards(UserGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/slides',
      filename: (_, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`)
      },
    }),
  }))
  async uploadSlides(
    @Param('applyId', ParseIntPipe) applyId: number,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
  ) {
    if (!file) {
      throw new BadRequestException('沒有上傳檔案')
    }

    try {
      const apply = await this.applyService.findOne(applyId)

      if (!apply) {
        throw new NotFoundException('找不到此投稿')
      }

      if (apply.userId !== session.user.userId) {
        throw new ForbiddenException('無法修改他人的投稿')
      }

      if (apply.slides) {
        await unlink(join('./uploads/slides', apply.slides)).catch(() => null)
      }
    }
    catch (error) {
      await unlink(file.path)
      throw error
    }

    return this.applyService.updateFile(applyId, 'slides', file.filename)
  }

  @Post('me/:applyId/poster')
  @UseGuards(UserGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/poster',
      filename: (_, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`)
      },
    }),
  }))
  async uploadPoster(
    @Param('applyId', ParseIntPipe) applyId: number,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
  ) {
    if (!file) {
      throw new BadRequestException('沒有上傳檔案')
    }

    try {
      const apply = await this.applyService.findOne(applyId)

      if (!apply) {
        throw new NotFoundException('找不到此投稿')
      }

      if (apply.userId !== session.user.userId) {
        throw new ForbiddenException('無法修改他人的投稿')
      }

      if (apply.poster) {
        await unlink(join('./uploads/poster', apply.poster)).catch(() => null)
      }
    }
    catch (error) {
      await unlink(file.path)
      throw error
    }

    return this.applyService.updateFile(applyId, 'poster', file.filename)
  }

  // ── 管理員路由 ──────────────────────────────────────────────

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.applyService.findAll()
  }

  @Patch(':applyId')
  @UseGuards(AdminGuard)
  async adminUpdate(
    @Param('applyId', ParseIntPipe) applyId: number,
    @Body() body: AdminUpdateApplyDto,
  ) {
    const apply = await this.applyService.findOne(applyId)

    if (!apply) {
      throw new NotFoundException('找不到此投稿')
    }

    return this.applyService.adminUpdate(applyId, body)
  }

  @Get(':applyId/slides')
  @UseGuards(AdminGuard)
  async downloadSlides(
    @Param('applyId', ParseIntPipe) applyId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const apply = await this.applyService.findOne(applyId)

    if (!apply) {
      throw new NotFoundException('找不到此投稿')
    }

    if (!apply.slides) {
      throw new NotFoundException('此投稿尚未上傳 slides')
    }

    const filePath = join('./uploads/slides', apply.slides)

    try {
      await stat(filePath)
    }
    catch {
      throw new NotFoundException('檔案不存在')
    }

    const buffer = await readFile(filePath)
    const fileTypeResult = await fromBuffer(buffer)

    res.set({
      'Content-Type': fileTypeResult?.mime ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${apply.slides}"`,
    })

    return new StreamableFile(createReadStream(filePath))
  }

  @Get(':applyId/poster')
  @UseGuards(AdminGuard)
  async downloadPoster(
    @Param('applyId', ParseIntPipe) applyId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const apply = await this.applyService.findOne(applyId)

    if (!apply) {
      throw new NotFoundException('找不到此投稿')
    }

    if (!apply.poster) {
      throw new NotFoundException('此投稿尚未上傳 poster')
    }

    const filePath = join('./uploads/poster', apply.poster)

    try {
      await stat(filePath)
    }
    catch {
      throw new NotFoundException('檔案不存在')
    }

    const buffer = await readFile(filePath)
    const fileTypeResult = await fromBuffer(buffer)

    res.set({
      'Content-Type': fileTypeResult?.mime ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${apply.poster}"`,
    })

    return new StreamableFile(createReadStream(filePath))
  }
}
