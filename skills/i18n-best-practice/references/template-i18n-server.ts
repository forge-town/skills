// TanStack Start 示例 — 在路由 loader 中同步服务端语言
// 如使用 Next.js / Remix，请按对应框架的服务端 API 读取 cookie
import { createServerFn } from "@tanstack/react-start";
import { parse } from "cookie";

/**
 * 从请求 cookie 中读取用户语言偏好。
 * 用于 SSR 路由 loader，防止客户端/服务端语言不一致导致水合错误。
 */
export const getServerLanguage = createServerFn({ method: "GET" }).handler(
  async (ctx) => {
    // @ts-expect-error TanStack Start 内部类型
    const request: Request | undefined = ctx.request;
    if (!request) return "zh";

    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return "zh";

    const cookies = parse(cookieHeader);
    return cookies["i18next"] ?? "zh";
  },
);
