import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Menu,
  X,
  Calendar,
  FileText,
  Plane,
  MessageCircle,
  Video,
} from "lucide-react";
import "./Header.css";

interface HeaderProps {
  onMenuItemClick?: (item: string) => void;
}

export default function Header({ onMenuItemClick }: HeaderProps) {
  const { t } = useTranslation("app");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = (item: string) => {
    setIsMenuOpen(false);
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
    <>
      <header className="app-header-bar">
        <div className="header-content">
          <div className="header-logo">
            <div className="logo-circle">T</div>
          </div>
          <h1 className="header-title">{t("appTitle")}</h1>
          <button
            type="button"
            className="hamburger-button"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {isMenuOpen && (
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
                      onClick={() => handleMenuItemClick(item.key)}
                    >
                      <IconComponent size={20} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      )}
    </>
  );
}
