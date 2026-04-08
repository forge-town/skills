/**
 * ✅ Good Example: 符合 shadcn/ui 设计哲学的组件
 *
 * 特点：
 * - 可复制粘贴，完全可修改
 * - 可组合，而非配置驱动
 * - 样式与逻辑分离
 * - 支持 asChild 模式
 * - 正确的类型定义
 */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ========================================
// Button 组件（原子组件）
// ========================================

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

// ========================================
// Card 组件族（可组合）
// ========================================

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

// ========================================
// 使用示例：组合上述组件
// ========================================

function UserCardExample() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>用户资料</CardTitle>
        <CardDescription>查看和管理您的个人信息</CardDescription>
      </CardHeader>
      <CardContent>
        <p>这里是内容区域，完全可定制。</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        {/* ✅ 使用 asChild 模式，Button 渲染为 Link */}
        <Button variant="outline" asChild>
          <a href="/profile">查看详情</a>
        </Button>
        <Button>编辑</Button>
      </CardFooter>
    </Card>
  );
}

/**
 * 设计亮点：
 *
 * 1. 可复制粘贴：所有代码都在这，没有外部依赖（除了工具函数）
 * 2. 可组合：Card、CardHeader、CardContent 等可以任意组合
 * 3. 样式分离：基础样式在组件内，定制通过 className
 * 4. asChild：Button 可以渲染为任意元素（这里是 <a>）
 * 5. 类型完整：每个组件都有正确的 TypeScript 类型
 * 6. forwardRef：支持 ref 转发
 * 7. displayName：调试友好
 * 8. 命名导出：支持 tree-shaking
 */
