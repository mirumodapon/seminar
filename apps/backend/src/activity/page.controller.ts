import { Body, ConflictException, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AdminGuard } from '../common/guard/role.guard'
import { ActivityService } from './activity.service'
import { CreatePageDto } from './dto/create-page.dto'
import { UpdatePageDto } from './dto/update-page.dto'
import { PageService } from './page.service'

@Controller('activity')
export class PageController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly pageService: PageService,
  ) { }

  @Post(':activityId/page')
  @UseGuards(AdminGuard)
  async createPage(
    @Param('activityId') activityId: string, @Body()
    createPageDto: CreatePageDto,
  ) {
    const activity = await this.activityService.findActivityById(activityId)

    if (!activity) {
      throw new NotFoundException('Activity not found')
    }

    const existingPage = await this.pageService.findPageById(activityId, createPageDto.pageId)

    if (existingPage) {
      throw new ConflictException('Page already exists')
    }

    return this.pageService.createPage(activityId, createPageDto)
  }

  @Get(':activityId/page/:pageId')
  async findPageById(
    @Param('activityId') activityId: string,
    @Param('pageId') pageId: string,
  ) {
    const page = await this.pageService.findPageById(activityId, pageId)

    if (!page) {
      throw new NotFoundException('Page not found')
    }

    return page
  }

  @Patch(':activityId/page/:pageId')
  @UseGuards(AdminGuard)
  async updatePage(
    @Param('activityId') activityId: string,
    @Param('pageId') pageId: string,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    const page = await this.pageService.updatePage(activityId, pageId, updatePageDto)

    if (!page) {
      throw new NotFoundException('Page not found')
    }

    return page
  }

  @Delete(':activityId/page/:pageId')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePage(
    @Param('activityId') activityId: string,
    @Param('pageId') pageId: string,
  ) {
    const affected = await this.pageService.deletePage(activityId, pageId)

    if (!affected) {
      throw new NotFoundException('Page not found')
    }
  }

  @Post(':activityId/page/:pageId')
  @UseGuards(AdminGuard)
  async recoverPage(
    @Param('activityId') activityId: string,
    @Param('pageId') pageId: string,
  ) {
    const page = await this.pageService.recoverPage(activityId, pageId)

    if (!page) {
      throw new NotFoundException('Page not found')
    }

    return page
  }
}
