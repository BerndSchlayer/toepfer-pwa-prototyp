import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Home,
  Calendar,
  FileText,
  Plane,
  MessageCircle,
  Video,
  Bell,
  MoreHorizontal,
} from "lucide-react";
import "./TopNavigation.css";

interface TopNavigationProps {
  currentPage: string;
  onMenuItemClick?: (item: string) => void;
}

export default function TopNavigation({
  currentPage,
  onMenuItemClick,
}: TopNavigationProps) {
  const { t } = useTranslation("app");
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setIsMoreMenuOpen(false);
      }
    };

    if (isMoreMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMoreMenuOpen]);

  const handleMenuItemClick = (item: string) => {
    if (onMenuItemClick) {
      onMenuItemClick(item);
    }
    setIsMoreMenuOpen(false);
  };

  const handleNotificationTest = async () => {
    if (!("Notification" in window)) {
      alert(t("notification.notSupported"));
      return;
    }

    if (Notification.permission === "granted") {
      showNotification();
    } else if (Notification.permission !== "denied") {
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

  // Hauptmenü: Fix sichtbare Buttons
  const primaryMenuItems = [
    { key: "home", icon: Home, label: t("menu.home") },
    { key: "schedule", icon: Calendar, label: t("menu.schedule") },
    { key: "payslips", icon: FileText, label: t("menu.payslips") },
    { key: "chat", icon: MessageCircle, label: t("menu.chat") },
  ];

  // Overflow-Menü: Zusätzliche Optionen
  const moreMenuItems = [
    { key: "vacation", icon: Plane, label: t("menu.vacation") },
    { key: "training", icon: Video, label: t("menu.training") },
    {
      key: "notification",
      icon: Bell,
      label: t("menu.notification"),
      isSpecial: true,
    },
  ];

  return (
    <header className="top-navigation">
      <div className="top-nav-container">
        <div className="top-nav-brand">
          <h1 className="top-nav-title">{t("appTitle")}</h1>
        </div>

        <nav className="top-nav-menu">
          {primaryMenuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPage === item.key;
            return (
              <button
                key={item.key}
                type="button"
                className={`top-nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleMenuItemClick(item.key)}
                title={item.label}
              >
                <IconComponent size={20} />
                <span className="top-nav-label">{item.label}</span>
              </button>
            );
          })}

          {/* Mehr-Menü */}
          <div className="top-nav-more" ref={moreMenuRef}>
            <button
              type="button"
              className="top-nav-item"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              title={t("menu.more")}
            >
              <MoreHorizontal size={20} />
              <span className="top-nav-label">{t("menu.more")}</span>
            </button>

            {isMoreMenuOpen && (
              <div className="top-nav-dropdown">
                {moreMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = currentPage === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`top-nav-dropdown-item ${
                        isActive ? "active" : ""
                      }`}
                      onClick={() =>
                        item.isSpecial
                          ? handleNotificationTest()
                          : handleMenuItemClick(item.key)
                      }
                    >
                      <IconComponent size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
