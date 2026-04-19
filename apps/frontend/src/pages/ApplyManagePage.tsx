import { useState } from 'react'
import { Link, useLoaderData, useRevalidator } from 'react-router'
import { api } from '~/service/api'

interface Apply {
  applyId: number
  activityId: string
  userId: number
  topic: string
  abstract: string
  author: string | null
  email: string | null
  keywords: string | null
  status: string
  accepted: boolean
  attended: boolean | null
  attendCount: number | null
  mealNormal: number | null
  mealLactoOvo: number | null
  mealVegan: number | null
  meal: string | null
  diningHibits: string | null
  slides: string | null
  poster: string | null
  createdAt: string | null
  updatedAt: string | null
}

const STATUS_OPTIONS = [
  { value: 'pending', label: '待審核' },
  { value: 'reviewing', label: '審核中' },
  { value: 'accepted', label: '已接受' },
  { value: 'rejected', label: '已拒絕' },
]

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  reviewing: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export async function loader({ params, request }: any) {
  const Cookie = request.headers.get('Cookie')
  const { activityId } = params

  try {
    const res = await api('/apply', { headers: { Cookie } })
    const applies = (res.data as Apply[]).filter(a => a.activityId === activityId)
    return { applies, activityId }
  }
  catch (err: any) {
    const response = err.response?.data
    throw new Response(response?.message ?? 'Error', { status: response?.statusCode ?? 500 })
  }
}

function ApplyManagePage() {
  const { applies, activityId } = useLoaderData<typeof loader>()
  const { revalidate } = useRevalidator()

  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selected, setSelected] = useState<Apply | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const BASE_URL = import.meta.env.VITE_API_URL

  async function handleExportAll() {
    setDownloading(true)
    setError(null)
    try {
      const res = await fetch(`${BASE_URL}/apply/export?activityId=${activityId}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? '下載失敗')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${activityId}-applies.zip`
      a.click()
      URL.revokeObjectURL(url)
    }
    catch (err: any) {
      setError(err.message ?? '下載失敗')
    }
    finally {
      setDownloading(false)
    }
  }

  const filtered = filterStatus === 'all'
    ? applies
    : applies.filter(a => a.status === filterStatus)

  async function handleStatusChange(applyId: number, status: string) {
    setError(null)
    setSaving(true)
    try {
      await api.patch(`/apply/${applyId}`, { status }, { withCredentials: true })
      revalidate()
      if (selected?.applyId === applyId)
        setSelected(prev => prev ? { ...prev, status } : prev)
    }
    catch (err: any) {
      setError(err.response?.data?.message ?? '更新失敗')
    }
    finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={`/admin/${activityId}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 返回活動管理
        </Link>
        <h1 className="text-2xl font-bold">投稿管理</h1>
        <span className="text-gray-400 text-sm">
          共
          {applies.length}
          {' '}
          筆
        </span>
        <div className="flex-1" />
        <button
          onClick={handleExportAll}
          disabled={downloading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? '產生中…' : '下載全部投稿 PDF'}
        </button>
        <Link
          to={`/admin/${activityId}/statistics`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          查看統計與下載
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          className={`px-3 py-1.5 rounded text-sm border ${filterStatus === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          onClick={() => setFilterStatus('all')}
        >
          全部（
          {applies.length}
          ）
        </button>
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`px-3 py-1.5 rounded text-sm border ${filterStatus === opt.value ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setFilterStatus(opt.value)}
          >
            {opt.label}
            （
            {applies.filter(a => a.status === opt.value).length}
            ）
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0
        ? (
            <div className="text-center py-16 border rounded text-gray-400">尚無投稿</div>
          )
        : (
            <div className="border rounded-lg overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">論文名稱</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">作者</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">狀態</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">附件</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(apply => (
                    <tr key={apply.applyId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800 max-w-xs truncate">{apply.topic}</div>
                        {apply.keywords && (
                          <div className="text-xs text-gray-400 max-w-xs mt-0.5 truncate">{apply.keywords}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[140px]">
                        <div className="truncate">{apply.author ?? '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[160px]">
                        <div className="truncate">{apply.email ?? '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${STATUS_STYLE[apply.status] ?? 'bg-gray-100 text-gray-600'}`}
                          value={apply.status}
                          disabled={saving}
                          onChange={e => handleStatusChange(apply.applyId, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {apply.slides
                            ? (
                                <a
                                  href={`${BASE_URL}/apply/${apply.applyId}/slides`}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  簡報
                                </a>
                              )
                            : <span className="text-gray-300 text-xs">無簡報</span>}
                          {apply.poster
                            ? (
                                <a
                                  href={`${BASE_URL}/apply/${apply.applyId}/poster`}
                                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  海報
                                </a>
                              )
                            : <span className="text-gray-300 text-xs">無海報</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                          onClick={() => setSelected(apply)}
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold pr-4">{selected.topic}</h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">狀態</div>
                  <select
                    className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${STATUS_STYLE[selected.status] ?? 'bg-gray-100 text-gray-600'}`}
                    value={selected.status}
                    disabled={saving}
                    onChange={e => handleStatusChange(selected.applyId, e.target.value)}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">投稿編號</div>
                  <div className="text-gray-700">
                    #
                    {selected.applyId}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-1">作者</div>
                <pre className="text-gray-700 whitespace-pre-wrap font-sans">{selected.author ?? '—'}</pre>
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-1">電子郵件</div>
                <div className="text-gray-700">{selected.email ?? '—'}</div>
              </div>

              {selected.keywords && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">關鍵字</div>
                  <div className="text-gray-700">{selected.keywords}</div>
                </div>
              )}

              <div>
                <div className="text-xs text-gray-400 mb-1">摘要</div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.abstract}</p>
              </div>

              {selected.status === 'accepted' && (
                <div className="border-t pt-4">
                  <div className="text-xs text-gray-400 mb-2">出席調查</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">是否出席</div>
                      <div className="text-gray-700">
                        {selected.attended === null ? '未填寫' : selected.attended ? '出席' : '不出席'}
                      </div>
                    </div>
                    {selected.attended && (
                      <div className="col-span-2">
                        <div className="text-xs text-gray-400 mb-1">出席詳情</div>
                        <div className="bg-gray-50 p-3 rounded border text-sm">
                          <div className="font-medium mb-1">
                            總人數:
                            {selected.attendCount ?? 0}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-gray-600">
                            <div>
                              葷:
                              {selected.mealNormal ?? 0}
                            </div>
                            <div>
                              蛋奶素:
                              {selected.mealLactoOvo ?? 0}
                            </div>
                            <div>
                              完全素:
                              {selected.mealVegan ?? 0}
                            </div>
                          </div>
                        </div>
                        {selected.diningHibits && (
                          <div className="mt-3">
                            <div className="text-xs text-gray-400 mb-1">飲食備註</div>
                            <div className="text-gray-700 whitespace-pre-wrap">{selected.diningHibits}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 border-t pt-4">
                {selected.slides
                  ? (
                      <a
                        href={`${BASE_URL}/apply/${selected.applyId}/slides`}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        target="_blank"
                        rel="noreferrer"
                      >
                        下載簡報
                      </a>
                    )
                  : <span className="text-sm text-gray-400">尚未上傳簡報</span>}
                {selected.poster
                  ? (
                      <a
                        href={`${BASE_URL}/apply/${selected.applyId}/poster`}
                        className="px-3 py-1.5 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                        target="_blank"
                        rel="noreferrer"
                      >
                        下載海報
                      </a>
                    )
                  : <span className="text-sm text-gray-400">尚未上傳海報</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplyManagePage
