# 组件设计哲学（shadcn/ui 精神）

## 1. 可复制粘贴，而非黑盒

**shadcn/ui 的核心：** 组件代码属于你，完全可修改。

- ✅ 组件放在 `components/ui/` 下，是项目代码的一部分
- ✅ 可以自由修改样式、行为、添加功能
- ❌ 不是 npm 包，不是不可触碰的第三方依赖

## 2. 原子化与可组合性

小颗粒的组件组合成大功能，而非大而全的组件。

```tsx
// ✅ 可组合：按需选择需要的部分
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>内容</CardContent>
  <CardFooter>底部</CardFooter>
</Card>

// ❌ 反模式：一个组件接收所有可能的配置
<Card
  title="标题"
  description="描述"
  content="内容"
  footer="底部"
/>
```

## 3. 样式与逻辑分离

组件关注结构和可访问性，样式通过 Tailwind 灵活控制。

```tsx
// ✅ 组件提供基础结构和功能
function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    />
  );
}

// ✅ 使用时自由定制样式
<Button className="bg-red-500 hover:bg-red-600">删除</Button>
<Button className="w-full mt-4">提交</Button>
```

## 4. 可访问性优先

组件必须是无障碍的，这是底线而非附加功能。

- 正确的 ARIA 属性
- 键盘导航支持
- 焦点管理
- 屏幕阅读器友好

## 5. 有意义的默认，完全的自由

提供合理的默认行为，但允许完全覆盖。

```tsx
// 有默认样式，但可被覆盖
<Input /> // 默认有边框、圆角、内边距

// 完全可定制
<Input className="border-0 bg-transparent" />
```
