import { useTranslation } from "react-i18next";
import { Calendar, FileText, Plane, MessageCircle, Video } from "lucide-react";
import "./Sidebar.css";

interface SidebarProps {
  onMenuItemClick?: (item: string) => void;
}

export default function Sidebar({ onMenuItemClick }: SidebarProps) {
  const { t } = useTranslation("app");

  const handleMenuItemClick = (item: string) => {
    if (onMenuItemClick) {
      onMenuItemClick(item);
    }
  };

  const menuItems = [
    { key: "schedule", icon: Calendar, label: t("menu.schedule") },
    { key: "payslips", icon: FileText, label: t("menu.payslips") },
    { key: "vacation", icon: Plane, label: t("menu.vacation") },
    { key: "chat", icon: MessageCircle, label: t("menu.chat") },
    { key: "training", icon: Video, label: t("menu.training") },
  ];

  return (
    <aside className="desktop-sidebar">
      <nav>
        <ul className="sidebar-menu-list">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  className="sidebar-menu-item"
                  onClick={() => handleMenuItemClick(item.key)}
                >
                  <IconComponent size={22} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
