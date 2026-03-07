import { createFileRoute } from '@tanstack/react-router'
import AccountLoginScreen from '#/features/auth/components/account-login-screen'

export const Route = createFileRoute('/login/account')({
  component: LoginAccountRoute,
})

function LoginAccountRoute() {
  return <AccountLoginScreen />
}
