import { useEffect } from 'react'

export default function Login() {
  useEffect(() => {
    if (window)
      window.location.replace('/api/auth/google')
  })

  return null
}
