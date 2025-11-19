import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Menu,
  X,
  Calendar,
  FileText,
  Plane,
  MessageCircle,
  Video,
  Bell,
} from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import "./Header.css";

interface HeaderProps {
  onMenuItemClick?: (item: string) => void;
}

export default function Header({ onMenuItemClick }: HeaderProps) {
  const { t } = useTranslation("app");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isLandscape, setIsLandscape] = useState(
    window.innerHeight <= 500 &&
      window.matchMedia("(orientation: landscape)").matches
  );

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      const landscape =
        window.innerHeight <= 500 &&
        window.matchMedia("(orientation: landscape)").matches;
      setIsDesktop(desktop);
      setIsLandscape(landscape);

      // Close menu when switching to desktop mode (but not in landscape)
      if (desktop && !landscape) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = (item: string) => {
    setIsMenuOpen(false);
    if (onMenuItemClick) {
      onMenuItemClick(item);
    }
  };

  const handleNotificationTest = async () => {
    setIsMenuOpen(false);

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
    <>
      <header className="app-header-bar">
        <div className="header-content">
          <div className="header-logo">
            <div className="logo-circle">T</div>
          </div>
          <h1 className="header-title">{t("appTitle")}</h1>
          {(!isDesktop || isLandscape) && (
            <button
              type="button"
              className="hamburger-button"
              onClick={toggleMenu}
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </header>

      {(!isDesktop || isLandscape) && isMenuOpen && (
        <>
          <div className="menu-overlay" onClick={toggleMenu} />
          <nav className="slide-menu">
            <ul className="menu-list">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      className="menu-item"
                      onClick={() =>
                        item.isSpecial
                          ? handleNotificationTest()
                          : handleMenuItemClick(item.key)
                      }
                    >
                      <IconComponent size={20} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
              <li className="menu-language-selector">
                <LanguageSelector variant="compact" />
              </li>
            </ul>
          </nav>
        </>
      )}
    </>
  );
}
