import type { Route } from './+types/Activity.page'
import { data } from 'react-router'
import Markdown from '~/components/share/Markdown'
import { api } from '~/service/http'

export async function loader({ params }: Route.LoaderArgs) {
  const pageId = params.pageId ?? 'HOME'

  try {
    const page = await api.get(`/activity/${params.activityId}/page/${pageId}`)
    return data(page)
  }
  catch (err: any) {
    throw data(null, { status: err.statusCode })
  }
}

function ActivityPage({ loaderData }: Route.ComponentProps) {
  return (
    <Markdown content={loaderData.content} />
  )
}

export default ActivityPage
