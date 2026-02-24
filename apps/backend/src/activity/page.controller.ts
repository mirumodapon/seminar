import { Body, ConflictException, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AdminGuard } from '../auth/guard'
import { CreatePageDto } from './dto/create-page.dto'
import { UpdatePageDto } from './dto/update-page.dto'
import { PageService } from './page.service'

@Controller('activity/:activityId/page')
export class PageController {
  constructor(private readonly pageService: PageService) { }

  @Get()
  findAll(@Param('activityId') activityId: string) {
    return this.pageService.findAll(activityId)
  }

  @Get(':pageId')
  async findOne(@Param('activityId') activityId: string, @Param('pageId') pageId: string) {
    const page = await this.pageService.findOne(activityId, pageId)

    if (!page) {
      throw new NotFoundException('找不到這個頁面')
    }

    return page
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Param('activityId') activityId: string, @Body() body: CreatePageDto) {
    const exists = await this.pageService.findOneIncludingDeleted(activityId, body.pageId)

    if (!exists) {
      return this.pageService.create(activityId, body)
    }

    if (exists.deletedAt) {
      return this.pageService.restore(activityId, body.pageId, body)
    }

    throw new ConflictException('這個頁面已經存在了')
  }

  @Patch(':pageId')
  @UseGuards(AdminGuard)
  async update(
    @Param('activityId') activityId: string,
    @Param('pageId') pageId: string,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    const page = await this.pageService.update(activityId, pageId, updatePageDto)

    if (!page) {
      throw new NotFoundException('找不到這個頁面')
    }

    return page
  }

  @Delete(':pageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminGuard)
  async remove(@Param('activityId') activityId: string, @Param('pageId') pageId: string) {
    const affect = await this.pageService.remove(activityId, pageId)

    if (affect === 0) {
      throw new NotFoundException('找不到這個頁面')
    }
  }
}
