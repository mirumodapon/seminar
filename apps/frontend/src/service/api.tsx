import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL: BASE_URL,
})

export async function getActivities(activityId: string) {
  try {
    const response = await api.get(`/activity/${activityId}`)

    return response.data
  }
  catch (err) {
    console.error(err)
    return null
  }
}

export async function getPage(activityId: string, pageId: string) {
  try {
    const response = await api.get(`/activity/${activityId}/page/${pageId}`)

    return response.data
  }
  catch (err) {
    console.error(err)
    return null
  }
}
