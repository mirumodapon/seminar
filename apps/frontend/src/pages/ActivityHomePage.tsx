import { useLoaderData } from 'react-router'
import { getPage } from '~/service/api'
import { Markdown } from '~/utils/markdown'

export async function loader({ params }: any) {
  const page = await getPage(params.activityId, 'HOME')

  if (!page) {
    throw new Response('Page not found', { status: 404 })
  }

  const content = new Markdown().safeRender(page.content)

  return { page, content }
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
  const { content } = useLoaderData()

  return (
    <div className="page-wrapper">
      {
        /* eslint-disable-next-line react-dom/no-dangerously-set-innerhtml */
        <div dangerouslySetInnerHTML={{ __html: content }} />
      }
    </div>
  )
}
