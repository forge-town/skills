/**
 * ✅ Good Example: 使用 Store 替代 Props Drilling
 *
 * 每个组件直接从 Store 获取需要的数据
 */
import { useUserStore } from "@/stores/userStore";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Page 组件 - 简洁，不传递数据
export function UserPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">用户资料</h1>
      <UserCard />
    </div>
  );
}

// UserCard - 中间层组件，不接收 props
function UserCard() {
  return (
    <Card>
      <UserHeader />
      <UserBody />
    </Card>
  );
}

// UserHeader - 直接从 Store 获取 user
function UserHeader() {
  const { user } = useUserStore();

  return (
    <CardHeader className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-lg font-semibold">{user.name}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
    </CardHeader>
  );
}

// UserBody - 直接从 Store 获取需要的数据和方法
function UserBody() {
  const { user, updateUser } = useUserStore();

  const handleUpdateBio = () => {
    const newBio = prompt("输入新的个人简介:", user.bio);
    if (newBio) {
      updateUser({ bio: newBio });
    }
  };

  return (
    <CardContent className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">个人简介</h3>
        <p className="mt-1">{user.bio || "暂无简介"}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">加入时间</h3>
        <p className="mt-1">{user.joinedAt}</p>
      </div>
      <Button onClick={handleUpdateBio}>编辑简介</Button>
    </CardContent>
  );
}

/**
 * 优势：
 * 1. 组件之间完全解耦，UserCard 不依赖任何 props
 * 2. UserHeader 和 UserBody 可以独立复用
 * 3. 数据流向清晰：Store → 使用组件
 * 4. 添加/删除中间层组件不会影响数据传递
 */
