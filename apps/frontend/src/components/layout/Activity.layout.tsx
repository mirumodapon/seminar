import type { Route } from './+types/Activity.layout'
import { useMemo } from 'react'
import { data, Outlet, useHref } from 'react-router'
import { api } from '~/service/http'
import { generateMeta } from '~/utils/meta'
import Navbar from '../share/Navbar'

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const activity = await api.get(`/activity/${params.activityId}`)
    return data(activity)
  }
  catch (err: any) {
    throw data(null, { status: err.statusCode })
  }
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) {
    return null
  }

  return generateMeta(loaderData)
}

function ActivityLayout({ loaderData }: Route.ComponentProps) {
  const activityPath = useHref('', { relative: 'route' })

  const pages = useMemo(
    () => loaderData.pages.map(({ title, pageId }: any) => ({
      label: title,
      path: pageId === 'HOME' ? activityPath : `${activityPath}/${pageId}`,
    })),
    [loaderData, activityPath],
  )

  return (
    <>
      <Navbar links={pages} />
      <Outlet />
    </>
  )
}

export default ActivityLayout
