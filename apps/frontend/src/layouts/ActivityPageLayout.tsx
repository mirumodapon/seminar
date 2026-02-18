import { Outlet, useLoaderData } from 'react-router'
import { getActivities } from '../service/api'

export async function loader({ params }: any) {
  const activity = await getActivities(params.activityId)

  if (!activity) {
    throw new Response('Activity not found', { status: 404 })
  }

  return { activity }
}

export function meta({ data }: any) {
  const { activity } = data

  if (!activity)
    return []

  return [
    { title: `${activity.name}` },
    { description: activity.description },
    { property: 'og:title', content: activity.title },
    { property: 'og:description', content: activity.description },
  ]
}

function ActivityPageLayout() {
  const { activity } = useLoaderData()
  return (
    <div>
      <pre>{JSON.stringify(activity, null, 2)}</pre>
      <Outlet />
    </div>
  )
}

export default ActivityPageLayout
