import type { RouteConfig } from '@react-router/dev/routes'
import { route } from '@react-router/dev/routes'

const routes: RouteConfig = [
  route(':activityId', 'components/layout/Activity.layout.tsx', [
    route(':pageId?', 'pages/Activity.page.tsx'),
  ]),
]

export default routes
