// ✅ i18n 客户端初始化最佳实践
// 文件位置: src/lib/i18n.ts

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslations from "../locales/en.json";
import zhTranslations from "../locales/zh.json";

// 防闪烁：读取已保存的语言
function getInitialLanguage(): string {
  if (typeof window === "undefined") return "zh";

  // 优先从 localStorage 读取
  const savedLang = localStorage.getItem("i18next");
  if (savedLang) return savedLang;

  // 其次从 cookie 读取
  const match = document.cookie.match(/i18next=([^;]+)/);
  if (match) return match[1];

  return "zh";
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // 防闪烁：直接使用已保存语言
    lng: getInitialLanguage(),

    // 兜底语言
    fallbackLng: "zh",

    // 禁用转义（React 已处理）
    interpolation: {
      escapeValue: false,
    },

    // 资源定义
    resources: {
      en: { translation: enTranslations },
      zh: { translation: zhTranslations },
    },

    // 语言检测配置
    detection: {
      order: ["cookie", "localStorage", "navigator"],
      caches: ["cookie", "localStorage"],
      lookupCookie: "i18next",
    },

    // React 配置
    react: {
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ["br", "i", "p", "span", "strong"],
    },
  });

export default i18n;
