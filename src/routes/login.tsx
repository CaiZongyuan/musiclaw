import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import LoginEntryScreen from '#/features/auth/components/login-entry-screen'

export const Route = createFileRoute('/login')({
  component: LoginRoute,
})

function LoginRoute() {
  const location = useLocation()

  if (location.pathname !== '/login') {
    return <Outlet />
  }

  return <LoginEntryScreen />
}
