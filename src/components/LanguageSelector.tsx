import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import "./LanguageSelector.css";

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageSelectorProps {
  variant?: "default" | "compact";
}

const languages: Language[] = [
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "ro", name: "Romanian", nativeName: "Română" },
];

export default function LanguageSelector({
  variant = "default",
}: LanguageSelectorProps) {
  const { i18n } = useTranslation();

  const changeLanguage = async (langCode: string) => {
    try {
      await i18n.changeLanguage(langCode);
      localStorage.setItem("preferredLanguage", langCode);
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  if (variant === "compact") {
    return (
      <div className="language-selector-compact">
        <Languages size={18} className="language-icon" />
        <select
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="language-select-compact"
          aria-label="Select language"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="language-selector">
      <div className="language-selector-header">
        <Languages size={20} className="language-icon" />
        <select
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="language-select"
          aria-label="Select language"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
