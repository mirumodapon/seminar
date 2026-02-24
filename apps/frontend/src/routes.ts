import type { RouteConfig } from '@react-router/dev/routes'
import { route } from '@react-router/dev/routes'

const routes: RouteConfig = [
  route('admin', 'pages/AdminPage.tsx'),
  route(':activityId', 'layouts/ActivityPageLayout.tsx', [
    route('', 'pages/ActivityHomePage.tsx'),
    route(':pageId', 'pages/ActivityPage.tsx'),
  ]),
]

export default routes
