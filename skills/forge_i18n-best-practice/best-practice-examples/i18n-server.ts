// ✅ i18n 服务端语言读取（SSR 项目）
// 文件位置: src/lib/i18n-server.ts

import { getCookie } from "vinxi/http";

/**
 * 在服务端获取当前语言
 * 用于 SSR 场景下保持服务端和客户端语言一致
 */
export async function getServerLanguage(): Promise<string> {
  const lang = getCookie("i18next");
  return lang || "zh";
}
