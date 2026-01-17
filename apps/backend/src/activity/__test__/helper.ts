import { randomBytes } from 'node:crypto'
import { CreateActivityDto } from '../dto/create-activity.dto'

export function generateFakeActivity(): CreateActivityDto {
  const activity: CreateActivityDto = {
    activityId: randomBytes(16).toString('hex'),
    name: randomBytes(5).toString('base64'),
    ogImage: randomBytes(16).toString('hex'),
    description: randomBytes(50).toString('base64'),
  }

  return activity
}
