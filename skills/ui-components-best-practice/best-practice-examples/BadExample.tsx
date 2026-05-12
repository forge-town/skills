import { useState } from "react";

/**
 * ❌ 错误示例：使用原生 HTML 元素
 *
 * 本示例展示**不应该**出现的写法
 * 以下所有原生元素都应替换为对应的组件库组件
 */
export function BadUserForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    newsletter: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="card w-full max-w-md">
      <div className="card-header">
        <h2>用户信息</h2>
      </div>
      <div className="card-content">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ❌ 错误：使用原生 input 而非 Input 组件 */}
          <div>
            <label htmlFor="name">姓名</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="请输入姓名"
              className="input"
            />
          </div>

          {/* ❌ 错误：使用原生 label 和 input 而非 Label 和 Input 组件 */}
          <div>
            <label htmlFor="email">邮箱</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="请输入邮箱"
              className="input"
            />
          </div>

          {/* ❌ 错误：使用原生 select 而非 Select 组件 */}
          <div>
            <label>角色</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="select"
            >
              <option value="">选择角色</option>
              <option value="admin">管理员</option>
              <option value="editor">编辑</option>
              <option value="viewer">访客</option>
            </select>
          </div>

          {/* ❌ 错误：使用原生 input[type="checkbox"] 而非 Checkbox 组件 */}
          <div className="flex items-center space-x-2">
            <input
              id="newsletter"
              type="checkbox"
              checked={formData.newsletter}
              onChange={(e) =>
                setFormData({ ...formData, newsletter: e.target.checked })
              }
            />
            <label htmlFor="newsletter">订阅邮件通知</label>
          </div>

          {/* ❌ 错误：使用原生 button 而非 Button 组件 */}
          <button type="submit" className="btn btn-primary w-full">
            提交
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * 常见错误对照表：
 *
 * ❌ <button>                    ✅ <Button>
 * ❌ <input type="text">         ✅ <Input>
 * ❌ <input type="checkbox">     ✅ <Checkbox>
 * ❌ <input type="radio">        ✅ <RadioGroup>
 * ❌ <select>                    ✅ <Select>
 * ❌ <textarea>                  ✅ <Textarea>
 * ❌ <label>                     ✅ <Label>
 * ❌ <table>                     ✅ <Table>
 * ❌ <dialog>                    ✅ <Dialog>
 * ❌ <hr>                        ✅ <Separator>
 * ❌ <div className="card">      ✅ <Card>
 */
