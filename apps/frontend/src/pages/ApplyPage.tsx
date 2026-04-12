import { useRef, useState } from 'react'
import { redirect, useLoaderData, useRevalidator } from 'react-router'
import { api } from '~/service/api'

interface ApplySchedule {
  activityId: string
  applyCreateDeadlineAt: string | null
  applyEditDeadlineAt: string | null
  slidesUploadDeadlineAt: string | null
  posterUploadDeadlineAt: string | null
}

interface Apply {
  applyId: number
  activityId: string
  author: string | null
  topic: string
  abstract: string
  status: string
  accepted: boolean
  attended: boolean
  keywords: string | null
  email: string | null
  meal: string | null
  mealNormal: number | null
  mealLactoOvo: number | null
  mealVegan: number | null
  attendCount: number | null
  diningHibits: string | null
  slides: string | null
  poster: string | null
  updatedAt: string | null
}

type FormState = { mode: null } | ({ mode: 'create' | 'edit' } & Partial<Apply>)

export async function loader({ params, request }: any) {
  const Cookie = request.headers.get('Cookie')
  const { activityId } = params

  if (!activityId) {
    throw new Response('Activity not found', { status: 404 })
  }

  try {
    const [applyRes, scheduleRes] = await Promise.all([
      api('/apply/me', { headers: { Cookie } }),
      api(`/activity/${activityId}/apply-schedule`, { headers: { Cookie } }),
    ])

    return {
      activityId,
      applies: (applyRes.data as Apply[]).filter(apply => apply.activityId === activityId),
      schedule: scheduleRes.data as ApplySchedule,
    }
  }
  catch (err: any) {
    const status = err.response?.status
    if (status === 401 || status === 403) {
      throw redirect('/login')
    }
    const response = err.response?.data
    throw new Response(response?.message ?? 'Error', { status: response?.statusCode ?? 500 })
  }
}

function getActionState(deadline: string | null) {
  if (!deadline) {
    return {
      isOpen: false,
      label: '未開放',
    }
  }

  const deadlineTime = new Date(deadline).getTime()

  if (Number.isNaN(deadlineTime) || Date.now() >= deadlineTime) {
    return {
      isOpen: false,
      label: '已截止',
    }
  }

  return {
    isOpen: true,
    label: `截止：${new Date(deadline).toLocaleString('zh-TW')}`,
  }
}

function ApplyPage() {
  const { activityId, applies, schedule } = useLoaderData<typeof loader>()
  const { revalidate } = useRevalidator()

  const [form, setForm] = useState<FormState>({ mode: null })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const slidesInputRef = useRef<HTMLInputElement>(null)
  const posterInputRef = useRef<HTMLInputElement>(null)
  const [uploadingFor, setUploadingFor] = useState<{ applyId: number, type: 'slides' | 'poster' } | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const createAction = getActionState(schedule.applyCreateDeadlineAt)
  const editAction = getActionState(schedule.applyEditDeadlineAt)
  const slidesUploadAction = getActionState(schedule.slidesUploadDeadlineAt)
  const posterUploadAction = getActionState(schedule.posterUploadDeadlineAt)
  const canSubmitCurrentForm = form.mode === 'create' ? createAction.isOpen : form.mode === 'edit' ? editAction.isOpen : false

  async function handleSubmit() {
    if (form.mode === null)
      return
    setError(null)

    if (!form.topic?.trim()) {
      setError('請填寫論文名稱')
      return
    }
    if (!form.author?.trim()) {
      setError('請填寫作者')
      return
    }
    if (!form.email?.trim()) {
      setError('請填寫電子郵件')
      return
    }
    if (!form.abstract?.trim()) {
      setError('請填寫摘要')
      return
    }
    if (!form.keywords?.trim()) {
      setError('請填寫關鍵字')
      return
    }

    if (form.status === 'accepted' && form.attended) {
      if (!form.attendCount || form.attendCount <= 0) {
        setError('請填寫出席人數')
        return
      }
      const totalMeals = (Number(form.mealNormal) || 0) + (Number(form.mealLactoOvo) || 0) + (Number(form.mealVegan) || 0)
      if (totalMeals > form.attendCount) {
        setError('餐食數量總和不可大於出席人數')
        return
      }
    }

    try {
      if (form.mode === 'create') {
        await api.post('/apply', form, { withCredentials: true })
        setSuccess('投稿成功！')
      }
      else {
        await api.patch(`/apply/me/${form.applyId}`, form, { withCredentials: true })
        setSuccess('修改成功！')
      }
      setForm({ mode: null })
      revalidate()
    }
    catch (err: any) {
      setError(err.response?.data?.message ?? '操作失敗')
    }
  }

  async function handleFileUpload(applyId: number, type: 'slides' | 'poster', file: File) {
    setError(null)
    setUploadProgress(0)
    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post(`/apply/me/${applyId}/${type}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const percent = e.total ? Math.round((e.loaded * 100) / e.total) : 0
          setUploadProgress(percent)
        },
      })
      setSuccess(`${type === 'slides' ? '簡報' : '海報'}上傳成功！`)
      revalidate()
    }
    catch (err: any) {
      setError(err.response?.data?.message ?? '上傳失敗')
    }
    finally {
      setUploadingFor(null)
      setUploadProgress(0)
    }
  }

  function triggerUpload(applyId: number, type: 'slides' | 'poster') {
    setUploadingFor({ applyId, type })
    if (type === 'slides')
      slidesInputRef.current?.click()
    else posterInputRef.current?.click()
  }

  const statusLabel: Record<string, string> = {
    pending: '待審核',
    reviewing: '審核中',
    accepted: '已接受',
    rejected: '已拒絕',
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">我的投稿</h1>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!createAction.isOpen}
          onClick={() => setForm({
            mode: 'create',
            activityId,
            author: '',
            topic: '',
            abstract: '',
            keywords: '',
            email: '',
            attendCount: 0,
            mealNormal: 0,
            mealLactoOvo: 0,
            mealVegan: 0,
          })}
        >
          新增投稿
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 text-sm">
        <div className="border rounded p-3">
          <div className="font-medium text-gray-800">建立投稿</div>
          <div className={createAction.isOpen ? 'text-green-600 mt-1' : 'text-red-500 mt-1'}>{createAction.label}</div>
        </div>
        <div className="border rounded p-3">
          <div className="font-medium text-gray-800">編輯投稿</div>
          <div className={editAction.isOpen ? 'text-green-600 mt-1' : 'text-red-500 mt-1'}>{editAction.label}</div>
        </div>
        <div className="border rounded p-3">
          <div className="font-medium text-gray-800">上傳簡報</div>
          <div className={slidesUploadAction.isOpen ? 'text-green-600 mt-1' : 'text-red-500 mt-1'}>{slidesUploadAction.label}</div>
        </div>
        <div className="border rounded p-3">
          <div className="font-medium text-gray-800">上傳海報</div>
          <div className={posterUploadAction.isOpen ? 'text-green-600 mt-1' : 'text-red-500 mt-1'}>{posterUploadAction.label}</div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4 flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>✕</button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={slidesInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.ppt,.pptx"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file && uploadingFor)
            handleFileUpload(uploadingFor.applyId, 'slides', file)
          e.target.value = ''
        }}
      />
      <input
        ref={posterInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file && uploadingFor)
            handleFileUpload(uploadingFor.applyId, 'poster', file)
          e.target.value = ''
        }}
      />

      {/* Apply List */}
      {applies.length === 0
        ? (
            <div className="text-center py-16 border rounded text-gray-400">
              {createAction.isOpen
                ? '尚無投稿，點擊右上角「新增投稿」開始投稿'
                : '尚無投稿，目前也未開放建立投稿'}
            </div>
          )
        : (
            <ul className="space-y-4">
              {applies.map(apply => (
                <li key={apply.applyId} className="border rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{apply.topic}</h3>
                      {apply.status === 'accepted' && (
                        apply.attended === null
                          ? (
                              <div className="text-sm text-red-500 font-bold mt-1">請確認是否出席</div>
                            )
                          : apply.attended
                            ? (
                                <div className="text-sm text-green-600 mt-1">
                                  已確認出席 (
                                  {apply.attendCount ?? 0}
                                  {' '}
                                  人)
                                  {(!apply.attendCount || apply.attendCount === 0) && <span className="text-red-500 ml-2 font-bold">請填寫出席人數</span>}
                                </div>
                              )
                            : (
                                <div className="text-sm text-gray-500 mt-1">不出席</div>
                              )
                      )}
                      {apply.updatedAt && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          最後更新：
                          {new Date(apply.updatedAt).toLocaleString('zh-TW')}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${apply.status === 'accepted'
                      ? 'bg-green-100 text-green-700'
                      : apply.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : apply.status === 'reviewing'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                    >
                      {statusLabel[apply.status] ?? apply.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{apply.abstract}</p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      className="px-3 py-1.5 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={uploadingFor?.applyId === apply.applyId || !editAction.isOpen}
                      onClick={() => setForm({
                        mode: 'edit',
                        ...apply,
                        attended: Boolean(apply.attended),
                      })}
                    >
                      編輯
                    </button>
                    <button
                      className={`px-3 py-1.5 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed ${apply.slides ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'}`}
                      disabled={uploadingFor?.applyId === apply.applyId || !slidesUploadAction.isOpen}
                      onClick={() => triggerUpload(apply.applyId, 'slides')}
                    >
                      {apply.slides ? '重新上傳簡報' : '上傳簡報'}
                    </button>
                    <button
                      className={`px-3 py-1.5 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed ${apply.poster ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'}`}
                      disabled={uploadingFor?.applyId === apply.applyId || !posterUploadAction.isOpen}
                      onClick={() => triggerUpload(apply.applyId, 'poster')}
                    >
                      {apply.poster ? '重新上傳海報' : '上傳海報'}
                    </button>
                  </div>

                  {uploadingFor?.applyId === apply.applyId && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>
                          上傳
                          {uploadingFor.type === 'slides' ? '簡報' : '海報'}
                          中...
                        </span>
                        <span>
                          {uploadProgress}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

      {/* Create / Edit Modal */}
      {form.mode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {form.mode === 'create' ? '新增投稿' : '編輯投稿'}
            </h2>

            <div className="space-y-4">
              {form.mode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">活動 ID</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    placeholder="請輸入活動 ID"
                    value={form.activityId ?? ''}
                    readOnly
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  論文名稱
                  <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="請輸入論文名稱"
                  value={form.topic ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, topic: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  作者
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={3}
                  placeholder="王小明, 國立屏東大學, 電腦科學系"
                  value={form.author ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, author: e.target.value }))}
                />
                <p className="text-xs text-gray-400 mt-1">每位作者佔一行，姓名、學校、系所以逗號隔開</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電子郵件
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  placeholder="請輸入電子郵件"
                  value={form.email ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  摘要
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={5}
                  placeholder="請輸入摘要"
                  value={form.abstract ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, abstract: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  關鍵字
                  <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="請輸入關鍵字"
                  value={form.keywords ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, keywords: e.target.value }))}
                />
              </div>
              {form.status === 'accepted' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">是否出席</label>
                    <select
                      className="w-full border rounded px-3 py-2 bg-white"
                      value={form.attended ? 'true' : 'false'}
                      onChange={e => setForm(prev => ({
                        ...prev,
                        attended: e.target.value === 'true',
                        ...(e.target.value === 'false' && { meal: null, diningHibits: null }),
                      }))}
                    >
                      <option value="false">不出席</option>
                      <option value="true">出席</option>
                    </select>
                  </div>
                  {form.attended && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">出席人數</label>
                        <input
                          type="number"
                          min={1}
                          className="w-full border rounded px-3 py-2"
                          value={form.attendCount ?? 0}
                          onChange={e => setForm(prev => ({ ...prev, attendCount: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="p-3 bg-gray-50 rounded border">
                        <label className="block text-sm font-medium text-gray-700 mb-2">餐食統計</label>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">葷</label>
                            <input
                              type="number"
                              min={0}
                              className="w-full border rounded px-2 py-1 text-sm"
                              value={form.mealNormal ?? 0}
                              onChange={e => setForm(prev => ({ ...prev, mealNormal: Number(e.target.value) }))}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">蛋奶素</label>
                            <input
                              type="number"
                              min={0}
                              className="w-full border rounded px-2 py-1 text-sm"
                              value={form.mealLactoOvo ?? 0}
                              onChange={e => setForm(prev => ({ ...prev, mealLactoOvo: Number(e.target.value) }))}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">完全素</label>
                            <input
                              type="number"
                              min={0}
                              className="w-full border rounded px-2 py-1 text-sm"
                              value={form.mealVegan ?? 0}
                              onChange={e => setForm(prev => ({ ...prev, mealVegan: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">飲食習慣（備註）</label>
                        <textarea
                          className="w-full border rounded px-3 py-2 text-sm"
                          rows={2}
                          placeholder="過敏原、其他飲食限制等"
                          value={form.diningHibits ?? ''}
                          onChange={e => setForm(prev => ({ ...prev, diningHibits: e.target.value }))}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              {error && (
                <p className="flex-1 text-sm text-red-600 self-center">{error}</p>
              )}
              {!canSubmitCurrentForm && (
                <p className="flex-1 text-sm text-red-600 self-center">
                  {form.mode === 'create' ? '目前未開放建立投稿' : '目前未開放編輯投稿'}
                </p>
              )}
              <button
                className="px-4 py-2 border rounded hover:bg-gray-50"
                onClick={() => setForm({ mode: null })}
              >
                取消
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canSubmitCurrentForm}
                onClick={handleSubmit}
              >
                {form.mode === 'create' ? '送出投稿' : '儲存修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplyPage
