import { createFileRoute } from '@tanstack/react-router'
import UsernameLoginScreen from '#/features/auth/components/username-login-screen'

export const Route = createFileRoute('/login/username')({
  component: LoginUsernameRoute,
})

function LoginUsernameRoute() {
  return <UsernameLoginScreen />
}
