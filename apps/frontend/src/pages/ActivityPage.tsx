import { useLoaderData } from 'react-router'
import { getPage } from '~/service/api'

export async function loader({ params }: any) {
  const page = await getPage(params.activityId, params.pageId)

  if (!page) {
    throw new Response('Page not found', { status: 404 })
  }

  return { page, pageId: params.pageId }
}

export function meta({ data }: any) {
  const { page } = data

  if (!page) {
    return []
  }

  return [
    { title: page.title },
    { description: page.description },
    { property: 'og:title', content: page.title },
    { property: 'og:description', content: page.description },
  ]
}

export default function ActivityPage() {
  const { page, pageId } = useLoaderData()

  return (
    <pre className="text-red-400">
      p:
      {pageId}
      {JSON.stringify(page, null, 2)}
    </pre>
  )
}
