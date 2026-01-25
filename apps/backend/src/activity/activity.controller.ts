import { Body, ConflictException, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post } from '@nestjs/common'
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
}
