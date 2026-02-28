import { redirect } from 'react-router'

export function loader() {
  throw redirect('/2026')
}

export default function HomePage() {
  return null
}
