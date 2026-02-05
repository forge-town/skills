import { cn } from "@code-arena/ui";
import { useStore } from "zustand";
import { useStandardWithStoreStore } from "./_store";

// shadcn/ui 核心组件
import { Button } from "@code-arena/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@code-arena/ui";
import { Input } from "@code-arena/ui";
import { Label } from "@code-arena/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@code-arena/ui";
import { Badge } from "@code-arena/ui";
import { Separator } from "@code-arena/ui";

// 扩展组件
import { Skeleton } from "@code-arena/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@code-arena/ui";

export const StandardWithStorePageContent = () => {
  const store = useStandardWithStoreStore();
  const { loading, searchQuery, selectedSort } = useStore(store, (state) => ({
    loading: state.loading,
    searchQuery: state.searchQuery,
    selectedSort: state.selectedSort,
  }));

  return (
    <div className={cn("container mx-auto py-6 space-y-6")}>
      {/* 页面头部 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
          <p className="text-muted-foreground">管理系统用户账户</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            导出用户
          </Button>
          <Button size="sm">添加用户</Button>
        </div>
      </div>

      <Separator />

      {/* 控制面板 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">搜索用户</Label>
              <Input
                id="search"
                placeholder="输入用户名或邮箱..."
                value={searchQuery}
                onChange={(e) =>
                  store.getState().setSearchQuery(e.target.value)
                }
              />
            </div>
            <div className="w-full md:w-48 space-y-2">
              <Label htmlFor="sort">排序方式</Label>
              <Select
                value={selectedSort}
                onValueChange={(value) =>
                  store.getState().setSelectedSort(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">按名称</SelectItem>
                  <SelectItem value="date">按日期</SelectItem>
                  <SelectItem value="status">按状态</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据展示区 */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>共 1,234 个用户</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* 示例数据 */}
                <TableRow>
                  <TableCell>张三</TableCell>
                  <TableCell>zhangsan@example.com</TableCell>
                  <TableCell>
                    <Badge variant="default">活跃</Badge>
                  </TableCell>
                  <TableCell>2024-01-15</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      编辑
                    </Button>
                    <Button variant="ghost" size="sm">
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>李四</TableCell>
                  <TableCell>lisi@example.com</TableCell>
                  <TableCell>
                    <Badge variant="secondary">未激活</Badge>
                  </TableCell>
                  <TableCell>2024-01-10</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      编辑
                    </Button>
                    <Button variant="ghost" size="sm">
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
