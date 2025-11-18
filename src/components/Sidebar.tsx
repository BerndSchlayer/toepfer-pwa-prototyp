import { useTranslation } from "react-i18next";
import {
  Calendar,
  FileText,
  Plane,
  MessageCircle,
  Video,
  Bell,
} from "lucide-react";
import LanguageSelector from "./LanguageSelector";
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

  const handleNotificationTest = async () => {
    // Prüfe ob Notifications unterstützt werden
    if (!("Notification" in window)) {
      alert(t("notification.notSupported"));
      return;
    }

    // Prüfe aktuelle Permission
    if (Notification.permission === "granted") {
      showNotification();
    } else if (Notification.permission !== "denied") {
      // Frage nach Berechtigung
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        showNotification();
      } else {
        alert(t("notification.permissionDenied"));
      }
    } else {
      alert(t("notification.permissionDenied"));
    }
  };

  const showNotification = () => {
    new Notification(t("notification.title"), {
      body: t("notification.body"),
      icon: "/toepfer-pwa-prototyp/logo-192x192.png",
      badge: "/toepfer-pwa-prototyp/logo-192x192.png",
    });
  };

  const menuItems = [
    { key: "schedule", icon: Calendar, label: t("menu.schedule") },
    { key: "payslips", icon: FileText, label: t("menu.payslips") },
    { key: "vacation", icon: Plane, label: t("menu.vacation") },
    { key: "chat", icon: MessageCircle, label: t("menu.chat") },
    { key: "training", icon: Video, label: t("menu.training") },
    {
      key: "notification",
      icon: Bell,
      label: t("menu.notification"),
      isSpecial: true,
    },
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
                  onClick={() =>
                    item.isSpecial
                      ? handleNotificationTest()
                      : handleMenuItemClick(item.key)
                  }
                >
                  <IconComponent size={22} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
          <li className="sidebar-language-selector">
            <LanguageSelector variant="compact" />
          </li>
        </ul>
      </nav>
    </aside>
  );
}
