import { Link, useLoaderData } from 'react-router'
import { api } from '~/service/api'

export async function loader() {
  try {
    const response = await api('/activity')
    return { activities: response.data }
  }
  catch (err: any) {
    const response = err.response.data
    throw new Response(response.message, { status: response.statusCode })
  }
}

function AdminPage() {
  const { activities } = useLoaderData()

  return (
    <div>
      <h1>Admin Page</h1>
      <ul>
        {
          activities.map((activity: any) => (
            <li key={activity.activityId}>
              <Link className="block w-125 h-30 rounded-md m-2 border p-3" to={`/admin/${activity.activityId}`}>
                {activity.name}
              </Link>
            </li>
          ))
        }
      </ul>
    </div>
  )
}

export default AdminPage
