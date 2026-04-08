import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * 用户信息表单 - 最佳实践示例
 *
 * 本示例展示如何正确使用组件库组件替代原生 HTML 元素
 */
export function UserForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    role: "",
    newsletter: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>用户信息</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 姓名输入 - 使用 Input 而非原生 input */}
          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="请输入姓名"
            />
          </div>

          {/* 邮箱输入 - 使用 Input 而非原生 input */}
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="请输入邮箱"
            />
          </div>

          {/* 个人简介 - 使用 Textarea 而非原生 textarea */}
          <div className="space-y-2">
            <Label htmlFor="bio">个人简介</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="请简单介绍你自己"
              rows={3}
            />
          </div>

          <Separator />

          {/* 角色选择 - 使用 Select 而非原生 select */}
          <div className="space-y-2">
            <Label>角色</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">管理员</SelectItem>
                <SelectItem value="editor">编辑</SelectItem>
                <SelectItem value="viewer">访客</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 订阅复选框 - 使用 Checkbox 而非原生 input[type="checkbox"] */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="newsletter"
              checked={formData.newsletter}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, newsletter: checked as boolean })
              }
            />
            <Label htmlFor="newsletter" className="cursor-pointer">
              订阅邮件通知
            </Label>
          </div>

          {/* 提交按钮 - 使用 Button 而非原生 button */}
          <Button type="submit" className="w-full">
            提交
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
