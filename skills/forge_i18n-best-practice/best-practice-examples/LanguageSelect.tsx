// ✅ 语言切换组件最佳实践
// 文件位置: src/components/LanguageSelect.tsx

import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 语言列表定义为组件外部常量
const languages = [
  { value: "en", label: "English" },
  { value: "zh", label: "简体中文" },
] as const;

export function LanguageSelect() {
  const { i18n } = useTranslation();

  // 使用 resolvedLanguage 获取实际解析后的语言
  const currentLang = i18n.resolvedLanguage || i18n.language || "zh";

  const handleChange = (value: string) => {
    // 只调用 changeLanguage，自动同步到 cookie 和 localStorage
    i18n.changeLanguage(value);
  };

  return (
    <Select value={currentLang} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
