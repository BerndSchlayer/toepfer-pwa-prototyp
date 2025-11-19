import { useTranslation } from "react-i18next";
import { Home, Calendar, FileText, MessageCircle, Video } from "lucide-react";
import "./BottomNavigation.css";

interface BottomNavigationProps {
  currentPage: string;
  onMenuItemClick?: (item: string) => void;
}

export default function BottomNavigation({
  currentPage,
  onMenuItemClick,
}: BottomNavigationProps) {
  const { t } = useTranslation("app");

  const handleMenuItemClick = (item: string) => {
    if (onMenuItemClick) {
      onMenuItemClick(item);
    }
  };

  const menuItems = [
    { key: "home", icon: Home, label: t("menu.home") },
    { key: "schedule", icon: Calendar, label: t("menu.schedule") },
    { key: "payslips", icon: FileText, label: t("menu.payslips") },
    { key: "chat", icon: MessageCircle, label: t("menu.chat") },
    { key: "training", icon: Video, label: t("menu.training") },
  ];

  return (
    <nav className="bottom-navigation">
      {menuItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = currentPage === item.key;
        return (
          <button
            key={item.key}
            type="button"
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
            onClick={() => handleMenuItemClick(item.key)}
          >
            <IconComponent size={24} />
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
