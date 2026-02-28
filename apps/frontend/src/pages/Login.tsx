import { useEffect } from 'react'

export default function Login() {
  useEffect(() => {
    if (window)
      window.location.href = '/api/auth/google'
  })

  return null
}
