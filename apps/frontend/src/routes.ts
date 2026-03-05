import type { RouteConfig } from '@react-router/dev/routes'
import { route } from '@react-router/dev/routes'

const routes: RouteConfig = [
  route('', 'pages/HomePage.tsx'),
  route('/login', 'pages/Login.tsx'),
  route('admin', 'pages/AdminPage.tsx'),
  route('admin/:activityId', 'pages/ActivityManagePage.tsx'),
  route('admin/:activityId/apply', 'pages/ApplyManagePage.tsx'),
  route(':activityId', 'layouts/ActivityPageLayout.tsx', [
    route('', 'pages/ActivityHomePage.tsx'),
    route('apply', 'pages/ApplyPage.tsx'),
    route(':pageId', 'pages/ActivityPage.tsx'),
  ]),
]

export default routes
