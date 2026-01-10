import { Body, ConflictException, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post } from '@nestjs/common'
import { ActivityService } from './activity.service'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) { }

  @Post()
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteActivity(@Param('id') activityId: string) {
    await this.activityService.deleteActivity(activityId)
  }
}
