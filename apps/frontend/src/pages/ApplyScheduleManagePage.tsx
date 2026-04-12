import { useState } from 'react'
import { Link, useLoaderData } from 'react-router'
import { api } from '~/service/api'

interface Activity {
  activityId: string
  name: string
}

interface ApplySchedule {
  activityId: string
  applyCreateDeadlineAt: string | null
  applyEditDeadlineAt: string | null
  slidesUploadDeadlineAt: string | null
  posterUploadDeadlineAt: string | null
}

interface LoaderData {
  activity: Activity
  schedule: ApplySchedule
}

interface ScheduleForm {
  applyCreateDeadlineAt: string
  applyEditDeadlineAt: string
  slidesUploadDeadlineAt: string
  posterUploadDeadlineAt: string
}

const scheduleFields: Array<{
  key: keyof ScheduleForm
  title: string
  description: string
}> = [
  {
    key: 'applyCreateDeadlineAt',
    title: '建立投稿截止時間',
    description: '控制使用者能否新增投稿。',
  },
  {
    key: 'applyEditDeadlineAt',
    title: '編輯投稿截止時間',
    description: '控制使用者能否修改既有投稿內容。',
  },
  {
    key: 'slidesUploadDeadlineAt',
    title: 'Slides 上傳截止時間',
    description: '控制使用者能否上傳或重新上傳 slides。',
  },
  {
    key: 'posterUploadDeadlineAt',
    title: 'Poster 上傳截止時間',
    description: '控制使用者能否上傳或重新上傳 poster。',
  },
]

export async function loader({ params, request }: any): Promise<LoaderData> {
  const Cookie = request.headers.get('Cookie')
  const { activityId } = params

  try {
    const [activityRes, scheduleRes] = await Promise.all([
      api(`/activity/${activityId}`, { headers: { Cookie } }),
      api(`/activity/${activityId}/apply-schedule`, { headers: { Cookie } }),
    ])

    return {
      activity: activityRes.data as Activity,
      schedule: scheduleRes.data as ApplySchedule,
    }
  }
  catch (err: any) {
    const response = err.response?.data
    throw new Response(response?.message ?? 'Error', { status: response?.statusCode ?? 500 })
  }
}

function toDateTimeLocalValue(value: string | null): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function toApiValue(value: string): string | null {
  if (!value) {
    return null
  }

  return new Date(value).toISOString()
}

function formatStatus(value: string) {
  if (!value) {
    return {
      label: '常時開放',
      className: 'text-green-600',
    }
  }

  const timestamp = new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return {
      label: '格式錯誤',
      className: 'text-red-500',
    }
  }

  if (Date.now() >= timestamp) {
    return {
      label: `已截止（${new Date(value).toLocaleString('zh-TW')}）`,
      className: 'text-red-500',
    }
  }

  return {
    label: `開放中，截止於 ${new Date(value).toLocaleString('zh-TW')}`,
    className: 'text-green-600',
  }
}

function buildInitialForm(schedule: ApplySchedule): ScheduleForm {
  return {
    applyCreateDeadlineAt: toDateTimeLocalValue(schedule.applyCreateDeadlineAt),
    applyEditDeadlineAt: toDateTimeLocalValue(schedule.applyEditDeadlineAt),
    slidesUploadDeadlineAt: toDateTimeLocalValue(schedule.slidesUploadDeadlineAt),
    posterUploadDeadlineAt: toDateTimeLocalValue(schedule.posterUploadDeadlineAt),
  }
}

function ApplyScheduleManagePage() {
  const { activity, schedule } = useLoaderData<typeof loader>()

  const [form, setForm] = useState<ScheduleForm>(() => buildInitialForm(schedule))
  const [savedSchedule, setSavedSchedule] = useState<ApplySchedule>(schedule)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const response = await api.patch(
        `/activity/${activity.activityId}/apply-schedule`,
        {
          applyCreateDeadlineAt: toApiValue(form.applyCreateDeadlineAt),
          applyEditDeadlineAt: toApiValue(form.applyEditDeadlineAt),
          slidesUploadDeadlineAt: toApiValue(form.slidesUploadDeadlineAt),
          posterUploadDeadlineAt: toApiValue(form.posterUploadDeadlineAt),
        },
        { withCredentials: true },
      )

      const nextSchedule = response.data as ApplySchedule
      setSavedSchedule(nextSchedule)
      setForm(buildInitialForm(nextSchedule))
      setSuccess('投稿時間設定已更新')
    }
    catch (err: any) {
      setError(err.response?.data?.message ?? '儲存失敗')
    }
    finally {
      setSaving(false)
    }
  }

  function clearField(key: keyof ScheduleForm) {
    setForm(prev => ({ ...prev, [key]: '' }))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={`/admin/${activity.activityId}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 返回活動管理
        </Link>
        <h1 className="text-2xl font-bold">
          {activity.name}
          {' '}
          投稿時間設定
        </h1>
      </div>

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

      <section className="border rounded-lg p-5 mb-6 bg-white">
        <h2 className="text-lg font-semibold mb-2">設定說明</h2>
        <p className="text-sm text-gray-600">
          每個操作都使用獨立的截止時間。留空代表該操作常時開放；一旦超過設定時間，對應 API 就會被後端 guard 關閉。
        </p>
      </section>

      <div className="space-y-4">
        {scheduleFields.map((field) => {
          const status = formatStatus(savedSchedule[field.key])

          return (
            <section key={field.key} className="border rounded-lg p-5 bg-white">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="text-lg font-semibold">{field.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                </div>
                <div className={`text-sm font-medium ${status.className}`}>{status.label}</div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">截止時間</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-3 py-2"
                    value={form[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  />
                </div>
                <button
                  type="button"
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  onClick={() => clearField(field.key)}
                >
                  清空
                </button>
              </div>
            </section>
          )
        })}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          className="px-4 py-2 border rounded hover:bg-gray-50"
          onClick={() => setForm(buildInitialForm(savedSchedule))}
        >
          還原未儲存變更
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? '儲存中...' : '儲存設定'}
        </button>
      </div>
    </div>
  )
}

export default ApplyScheduleManagePage
