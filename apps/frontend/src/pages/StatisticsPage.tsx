import { Link, useLoaderData } from 'react-router'
import { api } from '~/service/api'

interface Apply {
  applyId: number
  userId: number
  topic: string
  author: string | null
  email: string | null
  status: string
  accepted: boolean
  attended: boolean | null
  attendCount: number | null
  meal: string | null
  mealNormal: number | null
  mealLactoOvo: number | null
  mealVegan: number | null
  diningHibits: string | null
}

interface Statistics {
  totalAccepted: number
  totalAttendees: number
  totalNormal: number
  totalLactoOvo: number
  totalVegan: number
  applies: Apply[]
}

export async function loader({ params, request }: any) {
  const Cookie = request.headers.get('Cookie')
  const { activityId } = params

  try {
    const res = await api('/apply/statistics', {
      headers: { Cookie },
      params: { activityId },
    })
    return { stats: res.data as Statistics, activityId }
  }
  catch (err: any) {
    const response = err.response?.data
    throw new Response(response?.message ?? 'Error', { status: response?.statusCode ?? 500 })
  }
}

function StatisticsPage() {
  const { stats, activityId } = useLoaderData<typeof loader>()
  const BASE_URL = import.meta.env.VITE_API_URL

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/${activityId}/apply`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← 返回投稿管理
          </Link>
          <h1 className="text-2xl font-bold">報名統計</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-500 mb-1">通過審核</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalAccepted}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-500 mb-1">確認出席人數</div>
          <div className="text-2xl font-bold text-green-600">{stats.totalAttendees}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-500 mb-1">葷食</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalNormal}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-500 mb-1">蛋奶素</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalLactoOvo}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-500 mb-1">完全素</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalVegan}</div>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-800">詳細名單</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="px-6 py-3 font-medium">投稿標題</th>
                <th className="px-6 py-3 font-medium">作者</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">出席狀況</th>
                <th className="px-6 py-3 font-medium text-center">人數</th>
                <th className="px-6 py-3 font-medium">餐食選擇</th>
                <th className="px-6 py-3 font-medium">備註</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.applies.length === 0
                ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        尚無已接受的投稿
                      </td>
                    </tr>
                  )
                : (
                    stats.applies.map(app => (
                      <tr key={app.applyId} className="hover:bg-gray-50">
                        <td className="px-6 py-3 max-w-xs truncate" title={app.topic}>
                          {app.topic}
                        </td>
                        <td className="px-6 py-3 max-w-[150px] truncate" title={app.author ?? ''}>
                          {app.author}
                        </td>
                        <td className="px-6 py-3 max-w-[200px] truncate" title={app.email ?? ''}>
                          {app.email}
                        </td>
                        <td className="px-6 py-3">
                          {app.attended === null
                            ? <span className="text-gray-400">未填寫</span>
                            : app.attended
                              ? <span className="text-green-600 font-medium">出席</span>
                              : <span className="text-gray-500">不出席</span>}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {app.attended ? (app.attendCount ?? '-') : '-'}
                        </td>
                        <td className="px-6 py-3">
                          {app.attended
                            ? (
                                <div className="text-xs space-y-0.5 text-gray-600">
                                  {app.mealNormal! > 0 && (
                                    <div>
                                      葷:
                                      {app.mealNormal}
                                    </div>
                                  )}
                                  {app.mealLactoOvo! > 0 && (
                                    <div>
                                      蛋:
                                      {app.mealLactoOvo}
                                    </div>
                                  )}
                                  {app.mealVegan! > 0 && (
                                    <div>
                                      素:
                                      {app.mealVegan}
                                    </div>
                                  )}
                                  {(!app.mealNormal && !app.mealLactoOvo && !app.mealVegan) && '-'}
                                </div>
                              )
                            : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="px-6 py-3 max-w-xs truncate text-gray-500" title={app.diningHibits ?? ''}>
                          {app.diningHibits ?? '-'}
                        </td>
                      </tr>
                    ))
                  )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StatisticsPage
