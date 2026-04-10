// ✅ 基础用法 + Trans 富文本示例
// 文件位置: src/components/UserGreeting.tsx

import { useTranslation, Trans } from "react-i18next";

interface UserGreetingProps {
  userName: string;
}

export function UserGreeting({ userName }: UserGreetingProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* 基础用法 */}
      <h1>{t("homePage.title")}</h1>

      {/* 变量插值 */}
      <p>{t("homePage.voteFor", { name: userName })}</p>

      {/* 富文本使用 Trans 组件 */}
      <p>
        <Trans
          i18nKey="homePage.description"
          components={{ strong: <strong /> }}
        />
      </p>
    </div>
  );
}
