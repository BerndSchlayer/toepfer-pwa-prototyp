import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LanguageSelector from "./components/LanguageSelector";
import SchedulePage from "./pages/SchedulePage";
import PayslipsPage from "./pages/PayslipsPage";
import VacationPage from "./pages/VacationPage";
import ChatPage from "./pages/ChatPage";
import TrainingPage from "./pages/TrainingPage";
import "./App.css";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  const navigatorAny = window.navigator as any;
  const displayModeStandalone = window.matchMedia(
    "(display-mode: standalone)"
  ).matches;
  const iosStandalone = navigatorAny.standalone === true;
  return displayModeStandalone || iosStandalone;
}

function App() {
  const { t } = useTranslation("app");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [currentPage, setCurrentPage] = useState<string>("home");

  useEffect(() => {
    const ios = isIOS();
    const standalone = isInStandaloneMode();
    setIsIos(ios);
    setIsStandalone(standalone);

    if (ios && !standalone) {
      setShowIosHint(true);
    }

    const handler = (event: Event) => {
      const e = event as BeforeInstallPromptEvent;
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleMenuItemClick = (item: string) => {
    setCurrentPage(item);
  };

  const handleInstallClick = async () => {
    // Android, Desktop und Browser mit native Install Unterstützung
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch {
        // Ergebnis ist für dich hier nicht kritisch
      }
      setDeferredPrompt(null);
      setShowInstallButton(false);
      return;
    }

    // iOS Spezialfall, dort gibt es kein beforeinstallprompt
    if (isIos && !isStandalone) {
      setShowIosHint(true);
      return;
    }

    alert(t("installNotSupported"));
  };

  return (
    <div className="app-container">
      <Header onMenuItemClick={handleMenuItemClick} />
      <div className="app-layout">
        {isDesktop && <Sidebar onMenuItemClick={handleMenuItemClick} />}
        <main className="app-main">
          {currentPage === "schedule" && <SchedulePage />}
          {currentPage === "payslips" && <PayslipsPage />}
          {currentPage === "vacation" && <VacationPage />}
          {currentPage === "chat" && <ChatPage />}
          {currentPage === "training" && <TrainingPage />}
          {currentPage === "home" && (
            <>
              <section className="app-section">
                <h2 className="app-section-title">{t("homepageTitle")}</h2>
                <p className="app-section-text">{t("homepageText")}</p>
              </section>

              <section className="app-section">
                <h2 className="app-section-title">{t("language.title")}</h2>
                <p className="app-section-text">{t("language.description")}</p>
                <LanguageSelector />
              </section>

              <section className="app-section">
                <h2 className="app-section-title">{t("install.title")}</h2>
                <p className="app-section-text">{t("install.description")}</p>
                <div className="button-container">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className={`button-secondary ${
                      showInstallButton || (isIos && !isStandalone)
                        ? ""
                        : "disabled"
                    }`}
                  >
                    {t("installApp")}
                  </button>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {isIos && !isStandalone && showIosHint && (
        <div className="ios-hint">
          <p className="ios-hint-text">{t("iosHintText")}</p>
          <button
            type="button"
            onClick={() => setShowIosHint(false)}
            className="button-hint-close"
          >
            {t("closeHint")}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
