# 踩坑速查

| 现象 | 根因 | 修复 |
| --- | --- | --- |
| invalid input syntax for type uuid | better-auth 写入字符串 ID 到 uuid 列 | 将托管表 id 与 user_id 改为 text |
| column updated_at of relation verifications does not exist | verifications 缺少 updated_at | 增加 updated_at 字段并设置默认值 |
| Response body object should not be disturbed or locked | 路由中使用动态 import 导致请求体二次消费 | 路由改为顶层静态 import |
| social sign-in 403 Forbidden | Origin 不在 trustedOrigins | 开发环境添加 localhost 多端口 |
| useMount is not a function | react-use 导出兼容性问题 | 用 useEffect 替代 |
| useTranslation needs initReactI18next | i18n 初始化文件未提前导入 | 在应用入口先导入 i18n 初始化 |
| ECONNRESET | Windows 或 Docker 场景下 localhost 解析差异 | 改用 127.0.0.1 并补充 sslmode=disable |
| OAuth callback mismatch | 平台配置与代码 redirectURI 不一致 | 统一为同一 callback 地址 |
