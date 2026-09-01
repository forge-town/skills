import { cn } from "@repo/ui";
import { Button } from "@repo/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { Separator } from "@repo/ui";

export const SimpleNoStorePageContent = () => {
  return (
    <div className={cn("container mx-auto py-6 space-y-6")}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">关于我们</h1>
          <p className="text-muted-foreground">了解我们的使命、愿景和团队</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            联系我们
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>公司介绍</CardTitle>
            <CardDescription>我们致力于提供优质的软件解决方案</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                我们是一家专注于创新技术解决方案的公司，致力于为客户提供高质量、易用的软件产品和服务。
              </p>
              <p className="text-muted-foreground">
                通过不断的技术创新和用户体验优化，我们帮助企业提升效率，创造更大的商业价值。
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使命与愿景</CardTitle>
            <CardDescription>我们的核心价值观和未来目标</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">我们的使命</h3>
                <p className="text-sm text-muted-foreground">
                  通过技术创新，让复杂变得简单，让不可能变得可能。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">我们的愿景</h3>
                <p className="text-sm text-muted-foreground">
                  成为行业领先的技术解决方案提供商，服务全球客户。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>我们的团队</CardTitle>
            <CardDescription>一群充满激情的技术专家</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-2"></div>
                <h4 className="font-semibold">张三</h4>
                <p className="text-sm text-muted-foreground">技术总监</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-2"></div>
                <h4 className="font-semibold">李四</h4>
                <p className="text-sm text-muted-foreground">产品经理</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-2"></div>
                <h4 className="font-semibold">王五</h4>
                <p className="text-sm text-muted-foreground">前端工程师</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
