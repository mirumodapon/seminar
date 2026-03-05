import { useRef, useState } from 'react'
import { Link, useLoaderData, useRevalidator } from 'react-router'
import { api } from '~/service/api'

interface Activity {
  activityId: string
  name: string
  description?: string
  ogImage?: string
  banner?: string
  active: boolean
}

interface Page {
  pageId: string
  title: string
  description: string
  content: string
  order: number
}

type PageFormState = { mode: null } | ({ mode: 'create' | 'edit' } & Partial<Page>)

export async function loader({ params, request }: any) {
  const Cookie = request.headers.get('Cookie')
  const { activityId } = params

  try {
    const [activityRes, pagesRes] = await Promise.all([
      api(`/activity/${activityId}`, { headers: { Cookie } }),
      api(`/activity/${activityId}/page`, { headers: { Cookie } }),
    ])

    return { activity: activityRes.data as Activity, pages: pagesRes.data as Page[] }
  }
  catch (err: any) {
    const response = err.response?.data
    throw new Response(response?.message ?? 'Error', { status: response?.statusCode ?? 500 })
  }
}

function ActivityManagePage() {
  const { activity, pages } = useLoaderData<typeof loader>()
  const { revalidate } = useRevalidator()

  const [pageForm, setPageForm] = useState<PageFormState>({ mode: null })
  const [error, setError] = useState<string | null>(null)
  const [bannerCacheBust, setBannerCacheBust] = useState(0)
  const [ogImageCacheBust, setOgImageCacheBust] = useState(0)

  const bannerInputRef = useRef<HTMLInputElement>(null)
  const ogImageInputRef = useRef<HTMLInputElement>(null)

  const BASE_URL = import.meta.env.VITE_API_URL

  async function handleImageUpload(type: 'banner' | 'ogImage', file: File) {
    setError(null)
    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post(`/activity/${activity.activityId}/${type}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (type === 'banner')
        setBannerCacheBust(k => k + 1)
      else
        setOgImageCacheBust(k => k + 1)
      revalidate()
    }
    catch (err: any) {
      setError(err.response?.data?.message ?? '上傳失敗')
    }
  }

  async function handleSavePage() {
    if (pageForm.mode === null)
      return
    setError(null)

    try {
      if (pageForm.mode === 'create') {
        await api.post(
          `/activity/${activity.activityId}/page`,
          pageForm,
          { withCredentials: true },
        )
      }
      else {
        await api.patch(
          `/activity/${activity.activityId}/page/${pageForm.pageId}`,
          pageForm,
          { withCredentials: true },
        )
      }
      setPageForm({ mode: null })
      revalidate()
    }
    catch (err: any) {
      setError(err.response?.data?.message ?? '操作失敗')
    }
  }

  async function handleDeletePage(pageId: string) {
    if (!confirm(`確定要刪除「${pageId}」頁面嗎？`))
      return
    setError(null)

    try {
      await api.delete(`/activity/${activity.activityId}/page/${pageId}`, { withCredentials: true })
      revalidate()
    }
    catch (err: any) {
      setError(err.response?.data?.message ?? '刪除失敗')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {activity.name}
        {' '}
        管理
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button className="text-red-700 font-bold" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Quick Links */}
      <section className="mb-8">
        <div className="flex gap-3">
          <Link
            to={`/admin/${activity.activityId}/apply`}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
          >
            投稿管理
          </Link>
        </div>
      </section>

      {/* Images Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">圖片管理</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Banner */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Banner</h3>
            {activity.banner && (
              <img
                key={bannerCacheBust}
                src={`${BASE_URL}/activity/${activity.activityId}/banner`}
                alt="Banner"
                className="w-full aspect-video object-cover rounded border mb-2"
              />
            )}

            {!activity.banner && (
              <div className="w-full aspect-video bg-gray-100 rounded border flex items-center justify-center text-gray-400 mb-2">
                尚未上傳 Banner
              </div>
            )}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleImageUpload('banner', e.target.files[0])}
            />
            <button
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => bannerInputRef.current?.click()}
            >
              上傳 Banner
            </button>
          </div>

          {/* OG Image */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">OG Image</h3>

            {activity.ogImage && (
              <img
                key={ogImageCacheBust}
                src={`${BASE_URL}/activity/${activity.activityId}/ogImage`}
                alt="OG Image"
                className="w-full aspect-video object-cover rounded border mb-2"
              />
            )}
            {!activity.ogImage && (
              <div className="w-full aspect-video bg-gray-100 rounded border flex items-center justify-center text-gray-400 mb-2">
                尚未上傳 OG Image
              </div>
            )}
            <input
              ref={ogImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleImageUpload('ogImage', e.target.files[0])}
            />
            <button
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => ogImageInputRef.current?.click()}
            >
              上傳 OG Image
            </button>
          </div>
        </div>
      </section>

      {/* Pages Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">頁面管理</h2>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => setPageForm({ mode: 'create', pageId: '', title: '', description: '', content: '', order: 0 })}
          >
            新增頁面
          </button>
        </div>
        {pages.length === 0 && (
          <p className="text-gray-400 text-center py-8 border rounded">尚無頁面</p>
        )}
        <ul className="space-y-2">
          {pages.map(page => (
            <li key={page.pageId} className="flex items-center justify-between border rounded p-3">
              <div>
                <span className="font-medium">{page.title}</span>
                <span className="text-gray-400 text-sm ml-2">
                  (
                  {page.pageId}
                  )
                </span>
                <span className="text-gray-400 text-sm ml-2">
                  order:
                  {' '}
                  {page.order}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-sm"
                  onClick={() => setPageForm({ mode: 'edit', ...page })}
                >
                  編輯
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  onClick={() => handleDeletePage(page.pageId)}
                >
                  刪除
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Page Form Modal */}
      {
        pageForm.mode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {pageForm.mode === 'create' ? '新增頁面' : '編輯頁面'}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">順序 (Order)</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full border rounded px-3 py-2"
                    value={pageForm.order ?? 0}
                    onChange={e => setPageForm(prev => ({ ...prev, order: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">頁面 ID</label>
                  <input
                    className="w-full border rounded px-3 py-2 disabled:bg-gray-50"
                    value={pageForm.pageId ?? ''}
                    disabled={pageForm.mode === 'edit'}
                    onChange={e => setPageForm(prev => ({ ...prev, pageId: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={pageForm.title ?? ''}
                    onChange={e => setPageForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={pageForm.description ?? ''}
                    onChange={e => setPageForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">內容 (Markdown)</label>
                  <textarea
                    className="w-full border rounded px-3 py-2 font-mono text-sm"
                    rows={10}
                    value={pageForm.content ?? ''}
                    onChange={e => setPageForm(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  onClick={() => setPageForm({ mode: null })}
                >
                  取消
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={handleSavePage}
                >
                  儲存
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default ActivityManagePage
