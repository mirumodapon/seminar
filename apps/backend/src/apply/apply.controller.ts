import type { Response } from 'express'
import { createReadStream, existsSync } from 'node:fs'
import { readFile, stat, unlink } from 'node:fs/promises'
import { extname, join } from 'node:path'
import archiver from 'archiver'
import PDFDocument from 'pdfkit'
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
  Query,
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
import { ApplySchedule } from './apply-schedule.decorator'
import { ApplyScheduleGuard } from './apply-schedule.guard'
import { ApplyService } from './apply.service'
import { AdminUpdateApplyDto } from './dto/admin-update-apply.dto'
import { CreateApplyDto } from './dto/create-apply.dto'
import { UpdateApplyDto } from './dto/update-apply.dto'

const STATUS_FOLDER: Record<string, string> = {
  pending: '待審核',
  reviewing: '審核中',
  accepted: '已接受',
  rejected: '已拒絕',
}

type CJKFont = { path: string, family?: string }

function detectCJKFont(): CJKFont | null {
  const candidates: CJKFont[] = [
    { path: '/System/Library/Fonts/STHeiti Light.ttc', family: 'STHeitiSC-Light' },
    { path: '/usr/share/fonts/opentype/noto/NotoSansCJKsc-Regular.otf' },
    { path: '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', family: 'Noto Sans CJK SC Regular' },
  ]
  return candidates.find(c => existsSync(c.path)) ?? null
}

function buildApplyPDF(apply: Record<string, any>, font: CJKFont | null): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    if (font) {
      doc.registerFont('CJK', font.path, font.family)
      doc.font('CJK')
    }

    const LEFT = doc.page.margins.left
    const RIGHT = doc.page.width - doc.page.margins.right

    doc.fontSize(18).text(apply.topic ?? '（無標題）', { align: 'center' })
    doc.moveDown()

    doc.fontSize(12)

    // Author — hanging indent so wrapped lines align after the label
    const authorLabel = '作者：'
    const authorLabelW = doc.widthOfString(authorLabel)
    const authorY = doc.y
    doc.text(authorLabel, LEFT, authorY, { lineBreak: false })
    doc.text(apply.author ?? '—', LEFT + authorLabelW, authorY, {
      width: RIGHT - LEFT - authorLabelW,
      lineBreak: true,
    })
    doc.moveDown(0.5)

    if (apply.keywords) {
      const kwLabel = '關鍵字：'
      const kwLabelW = doc.widthOfString(kwLabel)
      const kwY = doc.y
      doc.text(kwLabel, LEFT, kwY, { lineBreak: false })
      doc.text(apply.keywords, LEFT + kwLabelW, kwY, {
        width: RIGHT - LEFT - kwLabelW,
        lineBreak: true,
      })
      doc.moveDown(0.5)
    }

    doc.moveDown(0.5)
    doc.moveTo(LEFT, doc.y).lineTo(RIGHT, doc.y).stroke()
    doc.moveDown()

    doc.fontSize(14).text('摘要', LEFT, doc.y)
    doc.moveDown(0.5)
    doc.fontSize(11).text(apply.abstract ?? '（無摘要）', LEFT, doc.y, {
      width: RIGHT - LEFT,
      align: 'justify',
      lineGap: 4,
    })

    doc.end()
  })
}

@Controller('apply')
export class ApplyController {
  constructor(private readonly applyService: ApplyService) { }

  // ── 使用者路由 ──────────────────────────────────────────────

  @Post()
  @ApplySchedule('create')
  @UseGuards(UserGuard, ApplyScheduleGuard)
  create(@Body() body: CreateApplyDto, @Session() session: Record<string, any>) {
    return this.applyService.create(session.user.userId, body)
  }

  @Get('me')
  @UseGuards(UserGuard)
  findMine(@Session() session: Record<string, any>) {
    return this.applyService.findByUser(session.user.userId)
  }

  @Patch('me/:applyId')
  @ApplySchedule('edit')
  @UseGuards(UserGuard, ApplyScheduleGuard)
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
      delete body.meal
      delete body.attended
      delete body.diningHibits
    }

    return this.applyService.update(applyId, body)
  }

  @Post('me/:applyId/slides')
  @ApplySchedule('slidesUpload')
  @UseGuards(UserGuard, ApplyScheduleGuard)
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
  @ApplySchedule('posterUpload')
  @UseGuards(UserGuard, ApplyScheduleGuard)
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

  @Get('statistics')
  @UseGuards(AdminGuard)
  getStatistics(@Query('activityId') activityId?: string) {
    return this.applyService.getStatistics(activityId)
  }

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

  @Get('export')
  @UseGuards(AdminGuard)
  async exportApplies(
    @Query('activityId') activityId: string,
    @Res() res: Response,
  ) {
    if (!activityId) {
      throw new BadRequestException('activityId 為必填')
    }

    const applies = await this.applyService.findByActivity(activityId)
    const font = detectCJKFont()

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(`${activityId}-applies.zip`)}`,
    )

    const arc = archiver('zip', { zlib: { level: 6 } })
    arc.pipe(res as any)

    for (const apply of applies) {
      try {
        const folder = STATUS_FOLDER[apply.status as string] ?? apply.status
        const pdfBuf = await buildApplyPDF(apply, font)
        const safeName = String(apply.topic ?? 'untitled')
          .replace(/[/\\?%*:|"<>]/g, '-')
          .slice(0, 50)
        arc.append(pdfBuf, { name: `${folder}/${apply.applyId}-${safeName}.pdf` })
      }
      catch {
        // skip failed entry
      }
    }

    await arc.finalize()
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
