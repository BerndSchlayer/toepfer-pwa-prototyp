import { useEffect, useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LanguageSelector from "./components/LanguageSelector";
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const PayslipsPage = lazy(() => import("./pages/PayslipsPage"));
const VacationPage = lazy(() => import("./pages/VacationPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const TrainingPage = lazy(() => import("./pages/TrainingPage"));
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
    // Android, Desktop und Browser mit nativer Install-Unterstützung
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch {
        // Ergebnis ist hier nicht kritisch
      }
      setDeferredPrompt(null);
      setShowInstallButton(false);
      return;
    }

    // iOS: Kein beforeinstallprompt. Unterschied Safari vs. Standalone.
    if (isIos) {
      if (!isStandalone) {
        // In Safari den Install-Hinweis anzeigen
        setShowIosHint(true);
      } else {
        // In der bereits installierten Web-App eine klare Meldung zeigen
        alert(t("alreadyInstalled"));
      }
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
          <Suspense
            fallback={
              <div className="route-suspense">
                <div className="splash-spinner" />
              </div>
            }
          >
            {currentPage === "schedule" && <SchedulePage />}
            {currentPage === "payslips" && <PayslipsPage />}
            {currentPage === "vacation" && <VacationPage />}
            {currentPage === "chat" && <ChatPage />}
            {currentPage === "training" && <TrainingPage />}
          </Suspense>
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
                      showInstallButton || isIos ? "" : "disabled"
                    }`}
                    aria-disabled={!(showInstallButton || isIos)}
                  >
                    {isIos && isStandalone
                      ? t("alreadyInstalled")
                      : t("installApp")}
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
