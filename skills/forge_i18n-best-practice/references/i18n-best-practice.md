# i18n 国际化最佳实践指南

基于 Daedalus 项目实践总结，适用于 React + TanStack Router / Vite 项目。

---

## 一、技术栈

| 包 | 版本 | 用途 |
|---|---|---|
| `i18next` | ^25 | 核心库 |
| `react-i18next` | ^16 | React 绑定 |
| `i18next-browser-languagedetector` | ^8 | 自动检测浏览器语言 |

---

## 二、目录结构

```
src/
  lib/
    i18n.ts          # 客户端初始化（必须）
    i18n-server.ts   # 服务端语言读取（SSR 项目必须）
  locales/
    en.json          # 英文翻译（必须）
    zh.json          # 中文翻译（必须，或其他目标语言）
  components/
    LanguageSelect.tsx  # 语言切换组件
```

---

## 三、初始化规范（i18n.ts）

### 3.1 语言检测顺序

```
cookie → localStorage → navigator（浏览器语言）
```

固定使用 `lookupCookie: 'i18next'`，caches 同时写回 cookie 和 localStorage。

### 3.2 防闪烁初始化

在 `i18n.init()` 前从 localStorage 或 cookie 读取已保存语言，通过 `lng` 选项直接使用，避免首屏语言闪烁。

### 3.3 必须配置项

```ts
{
  fallbackLng: 'zh',            // 兜底语言
  interpolation: { escapeValue: false },  // React 已转义，无需双重转义
  detection: {
    order: ['cookie', 'localStorage', 'navigator'],
    caches: ['cookie', 'localStorage'],
    lookupCookie: 'i18next',
  },
  react: {
    transSupportBasicHtmlNodes: true,   // 支持翻译文本中的 HTML 标签
    transKeepBasicHtmlNodesFor: ['br', 'i', 'p', 'span', 'strong'],
  },
}
```

---

## 四、翻译文件规范（locales/*.json）

### 4.1 结构：按页面/功能分组

```json
{
  "navigation": { "brand": "...", "login": "..." },
  "homePage": { "title": "...", "description": "..." },
  "login": { "title": "...", "emailLabel": "..." },
  "register": { "title": "...", "submitBtn": "..." },
  "sidebar": { "arena": "...", "profile": "..." },
  "userMenu": { "logout": "...", "dashboard": "..." }
}
```

- **命名空间**：顶层 key 对应页面名称或功能模块，使用 camelCase
- **叶子 key**：使用 camelCase，描述 UI 元素（`titleLabel`、`submitBtn`、`errorMessage`）
- **所有语言文件的 key 结构必须完全一致**

### 4.2 变量插值

使用 `{{variableName}}` 语法：

```json
{ "voteFor": "支持 {{name}}" }
```

组件中：`t('homePage.voteFor', { name: userName })`

### 4.3 HTML 富文本

```json
{ "description": "让代码<strong>投票</strong>说话" }
```

组件中使用 `<Trans>` 组件，而非 `t()` 直接渲染 HTML。

---

## 五、组件使用规范

### 5.1 基础用法

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <h1>{t('homePage.title')}</h1>;
};
```

### 5.2 语言切换

```tsx
const { i18n } = useTranslation();
const currentLang = i18n.resolvedLanguage || i18n.language || 'zh';

const handleChange = (lang: string) => {
  i18n.changeLanguage(lang);
};
```

- 使用 `i18n.resolvedLanguage` 而非直接 `i18n.language`，获取实际解析后的语言
- 切换操作会自动同步到 cookie 和 localStorage（由 LanguageDetector 处理）

### 5.3 富文本用法（Trans 组件）

```tsx
import { Trans } from 'react-i18next';

<Trans i18nKey="homePage.description" components={{ strong: <strong /> }} />
```

---

## 六、SSR 服务端语言同步

在 TanStack Start / Remix / Next.js 等 SSR 框架中，需服务端读取 cookie 来同步语言，防止水合(hydration)不匹配。

### 服务端读取语言（i18n-server.ts）

从请求的 `cookie` Header 中解析 `i18next` 字段，找不到时返回默认语言。

### 路由 loader 同步

```ts
// 路由 loader 中同步语言
loader: async () => {
  if (typeof globalThis !== 'undefined' && typeof window !== 'undefined') {
    return { lang: i18n.language };
  }
  const lang = await getServerLanguage();
  if (lang && i18n.language !== lang) {
    await i18n.changeLanguage(lang);
  }
  return { lang };
}
```

---

## 七、语言切换组件规范

```tsx
const languages = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '简体中文' },
];
```

- 语言列表定义为常量数组，置于组件外部
- 使用 `i18n.resolvedLanguage` 获取当前语言
- 切换逻辑只调用 `i18n.changeLanguage(value)`，无需手动操作 localStorage/cookie

---

## 八、测试 Mock 规范

在单元测试中 mock `react-i18next`，使 `t(key)` 直接返回 key，便于断言：

```ts
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'zh',
      resolvedLanguage: 'zh',
      changeLanguage: vi.fn(),
    },
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));
```

断言方式：

```ts
expect(screen.getByText('userMenu.logout')).toBeInTheDocument();
```

---

## 九、常见反模式（应避免）

| 反模式 | 正确做法 |
|---|---|
| 翻译文件 key 使用中文 | 使用英文语义 key，如 `login.title` |
| `t()` 直接内联 HTML 字符串 | 使用 `<Trans>` 组件 |
| 国际化逻辑散落在各组件中 | 统一在 `src/lib/i18n.ts` 初始化 |
| 切换语言时手动操作 cookie | 依赖 LanguageDetector 的 `caches` 配置自动同步 |
| 不同语言文件 key 结构不一致 | zh/en 的 key 结构必须完全镜像 |
| 忘记 SSR 同步导致水合不匹配 | 在路由 loader 中使用 `getServerLanguage()` 同步 |
