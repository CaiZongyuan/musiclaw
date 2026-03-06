import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'

export const Route = createFileRoute('/login')({ component: LoginRoute })

function LoginRoute() {
  return (
    <RoutePlaceholder
      eyebrow="Login"
      title="登录页骨架"
      description="这里后续会接入二维码登录、cookie 登录态恢复和用户资料拉取。第一阶段保持 YesPlayMusic 的网易云登录模型，不切到 better-auth 主流程。"
    />
  )
}
