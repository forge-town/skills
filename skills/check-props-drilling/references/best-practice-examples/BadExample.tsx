/**
 * ❌ Bad Example: Props Drilling（Props 透传）
 *
 * 数据通过多层组件传递，每层都没有使用，只是传递给下一层
 */
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";

// ❌ Page 组件从 Store 获取，然后开始传递
export function UserPage() {
  const { user } = useUserStore(); // 假设这里使用了某个 hook

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">用户资料</h1>
      {/* ❌ 开始传递 user */}
      <UserCard user={user} onUpdate={handleUpdate} />
    </div>
  );
}

// ❌ UserCard 接收 props，但只是透传给子组件
interface UserCardProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
}

function UserCard({ user, onUpdate }: UserCardProps) {
  // ❌ user 和 onUpdate 都没有直接使用！
  // 只是传递给子组件
  return (
    <Card>
      <UserHeader user={user} />
      <UserBody user={user} onUpdate={onUpdate} />
    </Card>
  );
}

// ❌ UserHeader 接收 props，但只是透传 Avatar
interface UserHeaderProps {
  user: User;
}

function UserHeader({ user }: UserHeaderProps) {
  // ❌ 又将 user 透传给 UserAvatar
  return (
    <CardHeader className="flex items-center gap-4">
      <UserAvatar user={user} />
      <UserInfo user={user} />
    </CardHeader>
  );
}

// ❌ UserAvatar 才是真正的使用者
interface UserAvatarProps {
  user: User;
}

function UserAvatar({ user }: UserAvatarProps) {
  // ✅ 这里才真正使用 user
  return (
    <Avatar>
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback>{user.name[0]}</AvatarFallback>
    </Avatar>
  );
}

// ❌ UserInfo 也是真正的使用者
interface UserInfoProps {
  user: User;
}

function UserInfo({ user }: UserInfoProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{user.name}</h2>
      <p className="text-sm text-muted-foreground">{user.email}</p>
    </div>
  );
}

// ❌ UserBody 同样接收 props 但部分透传
interface UserBodyProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
}

function UserBody({ user, onUpdate }: UserBodyProps) {
  // ✅ 这里使用了 user 和 onUpdate
  const handleUpdateBio = () => {
    const newBio = prompt("输入新的个人简介:", user.bio);
    if (newBio) {
      onUpdate({ bio: newBio });
    }
  };

  return (
    <CardContent className="space-y-4">
      <UserStats user={user} /> {/* ❌ 又透传了 */}
      <Button onClick={handleUpdateBio}>编辑简介</Button>
    </CardContent>
  );
}

// ❌ UserStats 才是数据的最终使用者
interface UserStatsProps {
  user: User;
}

function UserStats({ user }: UserStatsProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground">加入时间</h3>
      <p className="mt-1">{user.joinedAt}</p>
    </div>
  );
}

/**
 * 问题分析：
 *
 * 传递链：Page → UserCard → UserHeader → UserAvatar/UserInfo
 *                            ↓
 *                            UserBody → UserStats
 *
 * 1. UserCard：接收 user 和 onUpdate，没有直接使用，只是透传
 * 2. UserHeader：接收 user，没有直接使用，透传给 UserAvatar 和 UserInfo
 * 3. UserBody：虽然使用了 user 和 onUpdate，但又透传给 UserStats
 *
 * 这个组件树有 5 层深度，数据传递了 3-4 层才到达真正使用的地方
 *
 * 重构方法：
 * - UserCard、UserHeader 不接收任何 props
 * - UserAvatar、UserInfo、UserStats 直接从 useUserStore() 获取 user
 * - UserBody 直接从 store 获取 onUpdate
 */

// 为了编译通过，假装有这个 hook
function useUserStore() {
  return { user: {} as User, updateUser: (data: Partial<User>) => {} };
}

function handleUpdate(data: Partial<User>) {
  console.log(data);
}
