import { Body, ConflictException, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AdminGuard } from '../common/guard/role.guard'
import { ActivityService } from './activity.service'
import { CreateActivityDto } from './dto/create-activity.dto'
import { CreatePageDto } from './dto/create-page.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'
import { UpdatePageDto } from './dto/update-page.dto'
import { PageService } from './page.service'

@Controller('activity')
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly pageService: PageService,
  ) { }

  @Post()
  @UseGuards(AdminGuard)
  async createActivity(@Body() createActivityDto: CreateActivityDto) {
    const existingActivity = await this.activityService.findActivityById(createActivityDto.activityId)

    if (existingActivity) {
      throw new ConflictException('Activity already exists')
    }

    return this.activityService.createActivity(createActivityDto)
  }

  @Get(':id')
  async findActivityById(@Param('id') activityId: string) {
    const activity = await this.activityService.findActivityById(activityId)

    if (!activity) {
      throw new NotFoundException('Activity not found')
    }

    return activity
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  async updateActivity(
    @Param('id') activityId: string, @Body()
    updateActivityDto: UpdateActivityDto,
  ) {
    const activity = await this.activityService.updateActivity(activityId, updateActivityDto)

    if (!activity) {
      throw new NotFoundException('Activity not found')
    }

    return activity
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteActivity(@Param('id') activityId: string) {
    await this.activityService.deleteActivity(activityId)
  }

  @Post(':activityId')
  @UseGuards(AdminGuard)
  async recoverActivity(
    @Param('activityId') activityId: string,
  ) {
    const activity = await this.activityService.recoverActivity(activityId)

    if (!activity) {
      throw new NotFoundException('Activity not found')
    }

    return activity
  }

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
