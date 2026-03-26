import { useAppStore } from '@/stores/appStore'

export function UserGreeting() {
  const user = useAppStore((s) => s.user)

  if (!user) return null
  return <p className="text-sm">你好，{user.name}</p>
}
