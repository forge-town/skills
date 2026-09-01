# 视图组件模板 (View Component Template)

**文件命名**: `[PageName]Content.tsx`
**核心职责**: 视觉呈现与交互实现 (UI Implementation)。

## 配置示例 (Configuration Examples)

以下是不同复杂度页面的配置示例，系统会根据这些配置生成相应的代码结构：

### 简单展示页面配置
```json
{
  "pageName": "AboutPage",
  "features": {
    "hasStore": false,
    "uiComplexity": "simple"
  },
  "description": "公司介绍页面"
}
```
**生成特点**: 基础布局 + 基础组件，无状态管理，适合展示型页面。

### 标准数据管理页面配置
```json
{
  "pageName": "UserManagementPage",
  "features": {
    "hasStore": true,
    "uiComplexity": "standard"
  },
  "description": "用户管理页面"
}
```
**生成特点**: 包含搜索/过滤功能 + 列表展示，带状态管理，适合数据管理页面。

### 复杂功能页面配置
```json
{
  "pageName": "DashboardPage",
  "features": {
    "hasStore": true,
    "uiComplexity": "complex",
    "hasTabs": true
  },
  "description": "数据分析仪表板"
}
```
**生成特点**: 多标签页 + 高级交互 + 复杂状态管理，适合功能丰富的页面。

## 生成规则
1.  文件名必须以 `Content` 结尾。
2.  仅负责 UI 渲染，不应该定义 Context。
3.  如果页面有 Store，应通过 Hooks 消费数据。
4.  **优先使用 shadcn/ui 组件**，保持设计一致性。

## 核心组件导入

```tsx
import { cn } from "@repo/ui";
// {{StoreImport}}
import { useStore } from "zustand";
// import { use{{PageName}}Store } from "./_store";

// shadcn/ui 核心组件 (按使用频率排序)
import { Button } from "@repo/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui";
import { Badge } from "@repo/ui";
import { Separator } from "@repo/ui";

// 扩展组件 (按需导入)
import { Skeleton } from "@repo/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@repo/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui";
```

## 代码模板

### 基础布局模板

```tsx
export const {{PageName}}Content = () => {
  // {{StoreConnection}}
  // const { loading, searchQuery, selectedSort, viewMode } = use{{PageName}}Store();

  return (
    <div className={cn("container mx-auto py-6 space-y-6")}>
      {/* 页面头部 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{{PageName}}</h1>
          <p className="text-muted-foreground">
            页面描述信息
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">次要操作</Button>
          <Button size="sm">主要操作</Button>
        </div>
      </div>

      <Separator />

      {/* 主要内容区域 */}
      <div className="space-y-6">
        {/* TODO: 根据页面需求添加具体内容 */}
        <Card>
          <CardHeader>
            <CardTitle>内容标题</CardTitle>
            <CardDescription>内容描述</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              在此处添加页面具体内容
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
```

## 使用模式示例

### ✅ 推荐模式：功能完整页面

```tsx
export const {{PageName}}Content = () => {
  const store = use{{PageName}}Store();
  const { loading, searchQuery, selectedSort } = useStore(store, (state) => ({
    loading: state.loading,
    searchQuery: state.searchQuery,
    selectedSort: state.selectedSort,
  }));

  return (
    <div className={cn("container mx-auto py-6 space-y-6")}>
      {/* 头部 + 操作区 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
          <p className="text-muted-foreground">管理系统用户账户</p>
        </div>
        <Button>添加用户</Button>
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
                onChange={(e) => store.getState().setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48 space-y-2">
              <Label htmlFor="sort">排序方式</Label>
              <Select
                value={selectedSort}
                onValueChange={(value: "name" | "date" | "status") =>
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
            <div className="space-y-4">
              {/* 实际数据内容 */}
              <div className="text-muted-foreground">用户数据将在这里显示</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

### ✅ 推荐模式：数据表格页面

```tsx
export const {{PageName}}Content = () => {
  const store = use{{PageName}}Store();
  const { loading } = useStore(store, (state) => ({ loading: state.loading }));

  return (
    <div className={cn("container mx-auto py-6 space-y-6")}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据管理</h1>
          <p className="text-muted-foreground">表格形式展示数据</p>
        </div>
        <Button>导出数据</Button>
      </div>

      <Separator />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-[60px]" /></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell>示例数据</TableCell>
                  <TableCell><Badge variant="secondary">活跃</Badge></TableCell>
                  <TableCell>2024-01-01</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">编辑</Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
```

### ❌ 反例：避免过度嵌套

```tsx
// ❌ 错误的做法：过度嵌套，难以维护
export const {{PageName}}Content = () => {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardContent>
          <Card>
            <CardContent>
              <div className="p-4 border rounded">
                <Card>
                  <CardContent>
                    内容
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

// ✅ 正确的做法：保持合理的嵌套层级
export const {{PageName}}Content = () => {
  return (
    <div className={cn("container mx-auto py-6 space-y-6")}>
      <Card>
        <CardHeader>
          <CardTitle>主要内容</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Card>
              <CardContent>子内容</CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

### ❌ 反例：避免混合样式系统

```tsx
// ❌ 错误的做法：混合 Tailwind 和内联样式
export const {{PageName}}Content = () => {
  return (
    <div style={{ padding: '24px', margin: '0 auto', maxWidth: '1200px' }}>
      <h1 className="text-3xl font-bold" style={{ color: '#333' }}>
        标题
      </h1>
      <Button style={{ backgroundColor: 'blue', color: 'white' }}>
        按钮
      </Button>
    </div>
  );
};

// ✅ 正确的做法：统一使用 Tailwind CSS
export const {{PageName}}Content = () => {
  return (
    <div className={cn("container mx-auto py-6")}>
      <h1 className="text-3xl font-bold text-foreground">
        标题
      </h1>
      <Button className="bg-primary text-primary-foreground">
        按钮
      </Button>
    </div>
  );
};
```

### ❌ 反例：避免直接操作 DOM

```tsx
// ❌ 错误的做法：在组件中直接操作 DOM
export const {{PageName}}Content = () => {
  useEffect(() => {
    const element = document.getElementById('my-element');
    if (element) {
      element.style.display = 'none';
    }
  }, []);

  return (
    <div id="my-element">
      内容
    </div>
  );
};

// ✅ 正确的做法：使用 React 状态管理
export const {{PageName}}Content = () => {
  const [visible, setVisible] = useState(true);

  return (
    <div className={cn({ hidden: !visible })}>
      内容
      <Button onClick={() => setVisible(false)}>隐藏</Button>
    </div>
  );
};
```

## 最佳实践

### 🎯 组件选择原则
- **布局容器**: 优先使用 `Card` 而非裸 `div`
- **按钮操作**: 统一使用 `Button` 组件
- **表单元素**: 使用 `Input`, `Select`, `Label` 组合
- **状态展示**: 使用 `Badge` 表示状态
- **数据展示**: 复杂数据使用 `Table`，简单数据使用 `Card`

### 🎨 样式一致性
- 使用 `cn()` 函数合并 Tailwind 类
- 遵循设计系统颜色变量 (`text-muted-foreground`, `bg-card` 等)
- 保持合理的间距 (`space-y-6`, `gap-4`)

### ⚡ 性能优化
- 使用 `useStore` 的 selector 参数避免不必要的重渲染
- 复杂计算使用 `useMemo`
- 大列表使用虚拟滚动

### 🔧 维护性
- 组件职责单一，UI 与业务逻辑分离
- 使用语义化的组件命名
- 保持代码 DRY 原则
```
