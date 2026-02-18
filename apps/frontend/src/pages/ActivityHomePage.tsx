import { useLoaderData } from 'react-router'
import { getPage } from '~/service/api'

export async function loader({ params }: any) {
  const page = await getPage(params.activityId, 'HOME')

  if (!page) {
    throw new Response('Page not found', { status: 404 })
  }

  return { page }
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
  const { page } = useLoaderData()

  return (
    <pre className="text-red-400">
      {JSON.stringify(page, null, 2)}
    </pre>
  )
}
