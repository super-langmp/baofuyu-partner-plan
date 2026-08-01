import { useEffect, useState } from 'react'
import { LandingPage } from './pages/LandingPage'
import { AdminPage } from './pages/AdminPage'
import { MemberCenter } from './pages/MemberCenter'

function currentRoute() {
  return window.location.hash.replace(/^#/, '') || '/'
}

export default function App() {
  const [route, setRoute] = useState(currentRoute)

  useEffect(() => {
    const onHashChange = () => setRoute(currentRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (route.startsWith('/task-center')) {
    return <MemberCenter />
  }

  if (route.startsWith('/admin')) {
    return <AdminPage />
  }

  return <LandingPage />
}
