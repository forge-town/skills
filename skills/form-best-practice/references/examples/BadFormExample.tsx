// ❌ 反模式：使用 useState 手动管理每个表单字段
// 问题：状态分散、无统一校验机制、难以扩展复杂场景

import { useState } from "react";

export function BadFormExample() {
  // ❌ 禁止：每个字段单独 useState
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ❌ 需要手动校验，逻辑分散
    if (!name || !email) return;
    console.log({ name, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ❌ 手动处理 value 和 onChange */}
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
}
