import { randomBytes } from 'node:crypto'
import { CreateActivityDto } from '../dto/create-activity.dto'

export function generateFakeActivity({ ogImage = false, description = false } = {}): CreateActivityDto {
  const activity: CreateActivityDto = {
    activityId: randomBytes(16).toString('hex'),
    name: randomBytes(5).toString('base64'),
  }

  if (ogImage) {
    activity.ogImage = randomBytes(16).toString('hex')
  }

  if (description) {
    activity.description = randomBytes(50).toString('base64')
  }

  return activity
}
