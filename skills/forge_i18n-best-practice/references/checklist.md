# i18n 最佳实践检查清单

执行规则：**逐项勾选，若有任何一项为 ❌，必须修正后重新检查，不得跳过输出。**

---

## 一、依赖与文件结构

### 1.1 依赖

- [ ] ✅ 已安装 `i18next`、`react-i18next`、`i18next-browser-languagedetector`
  - ❌ 缺少任意一个包 → 运行 `pnpm add i18next react-i18next i18next-browser-languagedetector`

### 1.2 文件位置

- [ ] ✅ 客户端初始化文件位于 `src/lib/i18n.ts`
  - ❌ 放在组件文件夹或页面文件中 → 必须抽取到 `src/lib/`
- [ ] ✅ SSR 项目中服务端语言读取文件位于 `src/lib/i18n-server.ts`
  - ❌ 服务端逻辑混在客户端 i18n.ts 中 → 必须拆分
- [ ] ✅ 翻译文件位于 `src/locales/` 目录，命名为 `{lang}.json`（如 `en.json`、`zh.json`）
  - ❌ 翻译文件散落在各组件目录 → 必须集中到 `src/locales/`

---

## 二、i18n.ts 初始化

- [ ] ✅ 使用 `.use(LanguageDetector)` 启用自动语言检测
  - ❌ 硬编码 `lng: 'zh'` 且无检测器 → 用户浏览器语言将被忽略
- [ ] ✅ 使用 `.use(initReactI18next)` 绑定 React
  - ❌ 缺少此行 → `useTranslation` 钩子将报错
- [ ] ✅ 配置 `fallbackLng` 为项目默认语言（通常为 `'zh'`）
  - ❌ 未配置 fallbackLng → 缺失 key 时显示 key 字符串而非降级文本
- [ ] ✅ `interpolation.escapeValue` 设为 `false`
  - ❌ 为 `true` 或未配置 → React 会双重转义，导致 `&amp;` 等乱码输出
- [ ] ✅ `detection.order` 为 `['cookie', 'localStorage', 'navigator']`
  - ❌ 顺序错误（如 navigator 在前）→ 用户手动切换的语言无法持久化
- [ ] ✅ `detection.caches` 包含 `['cookie', 'localStorage']`
  - ❌ 未配置 caches → 每次刷新都会重置语言选择
- [ ] ✅ `detection.lookupCookie` 为 `'i18next'`
  - ❌ 使用自定义 cookie 名称而未与服务端同步 → SSR 语言不一致
- [ ] ✅ 在 `init()` 前从 localStorage/cookie 读取已保存语言，传入 `lng` 选项（防闪烁）
  - ❌ 无防闪烁逻辑 → 首屏可能短暂显示 fallback 语言

---

## 三、翻译文件结构

- [ ] ✅ 顶层 key 按页面或功能模块分组（camelCase，如 `homePage`、`login`、`sidebar`）
  - ❌ 所有 key 平铺在一级 → 项目增长后难以维护，key 冲突概率高
- [ ] ✅ 叶子 key 使用 camelCase 英文语义名称（如 `submitBtn`、`errorMessage`）
  - ❌ 使用中文 key 或 snake_case → 不符合 i18next 社区惯例
- [ ] ✅ 所有语言文件的 key 结构完全一致（镜像关系）
  - ❌ en.json 有某 key 而 zh.json 没有（或反之）→ 运行时回退到 key 字符串，UI 残破
- [ ] ✅ 变量插值使用 `{{variableName}}` 语法
  - ❌ 使用 `%s` 或 `{0}` 等其他占位符 → i18next 不支持，不会替换

---

## 四、组件用法

- [ ] ✅ 使用 `useTranslation()` 钩子获取 `t` 函数
  - ❌ 直接导入 i18n 实例并调用 `i18n.t()` → 不会自动响应语言切换
- [ ] ✅ 获取当前语言使用 `i18n.resolvedLanguage || i18n.language || 'zh'`
  - ❌ 只用 `i18n.language` → 某些检测器初始化前值为 undefined
- [ ] ✅ 富文本翻译使用 `<Trans>` 组件，不使用 `dangerouslySetInnerHTML`
  - ❌ `<div dangerouslySetInnerHTML={{ __html: t('key') }}` → 存在 XSS 风险

---

## 五、语言切换组件

- [ ] ✅ 语言列表定义为组件外部的常量数组
  - ❌ hardcode 在 JSX 中 → 新增语言时需多处修改
- [ ] ✅ 切换时只调用 `i18n.changeLanguage(value)`，不手动操作 localStorage/cookie
  - ❌ 手动 `localStorage.setItem(...)` → 与 LanguageDetector 的 caches 逻辑重复，可能冲突

---

## 六、SSR 同步（适用于 TanStack Start / Next.js / Remix）

- [ ] ✅ 服务端通过解析请求 `cookie` Header 读取 `i18next` 字段获取语言
  - ❌ 服务端硬编码返回固定语言 → 中英文用户看到同一语言，水合可能不匹配
- [ ] ✅ 根路由 loader 中判断：SSR 环境调用 `getServerLanguage()`，客户端直接返回 `i18n.language`
  - ❌ loader 中无语言同步逻辑 → SSR HTML 与客户端渲染语言不一致，出现 hydration warning

---

## 七、测试

- [ ] ✅ 单元测试中通过 `vi.mock('react-i18next', ...)` mock 掉 `useTranslation`，使 `t(key)` 返回 key 本身
  - ❌ 测试中真实调用 i18n 初始化逻辑 → 测试依赖文件系统/浏览器 API，环境不稳定
- [ ] ✅ 断言文本使用 key 字符串（如 `screen.getByText('userMenu.logout')`）
  - ❌ 断言实际翻译文本 → 翻译文案修改后测试全部失败，维护成本高
