import { useEffect, useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import TopNavigation from "./components/TopNavigation";
import BottomNavigation from "./components/BottomNavigation";
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

type NavigationMode = "sidebar" | "top" | "bottom";

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
  const [navigationMode, setNavigationMode] = useState<NavigationMode>(() => {
    const saved = localStorage.getItem("navigationMode");
    return (saved as NavigationMode) || "sidebar";
  });

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
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("navigationMode", navigationMode);
  }, [navigationMode]);

  const handleMenuItemClick = (item: string) => {
    setCurrentPage(item);
  };

  const handleNavigationModeChange = (mode: NavigationMode) => {
    setNavigationMode(mode);
    setCurrentPage("home");
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

  const logoSrc = `${import.meta.env.BASE_URL}${encodeURI(
    "LOGO Standard freigestellt.jpg"
  )}`;

  return (
    <div className="app-container">
      {navigationMode === "sidebar" && (
        <Header onMenuItemClick={handleMenuItemClick} />
      )}
      {navigationMode === "top" && (
        <TopNavigation
          currentPage={currentPage}
          onMenuItemClick={handleMenuItemClick}
        />
      )}
      <div
        className={`app-layout ${
          navigationMode === "sidebar" ? "with-sidebar" : ""
        }`}
      >
        {isDesktop && navigationMode === "sidebar" && (
          <Sidebar onMenuItemClick={handleMenuItemClick} />
        )}
        <main
          className={`app-main ${
            navigationMode === "bottom" ? "with-bottom-nav" : ""
          }`}
        >
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
              <section className="app-section homepage-intro">
                <div className="homepage-logo">
                  <img
                    src={logoSrc}
                    alt={t("appTitle")}
                    width={128}
                    height={128}
                  />
                </div>
                <h2 className="app-section-title">{t("homepageTitle")}</h2>
                <p className="app-section-text">{t("homepageText")}</p>
              </section>

              <section className="app-section">
                <h2 className="app-section-title">{t("language.title")}</h2>
                <p className="app-section-text">{t("language.description")}</p>
                <LanguageSelector />
              </section>

              <section className="app-section">
                <h2 className="app-section-title">{t("navigation.title")}</h2>
                <p className="app-section-text">
                  {t("navigation.description")}
                </p>
                <div className="button-container">
                  <button
                    type="button"
                    onClick={() => handleNavigationModeChange("sidebar")}
                    className={`button-secondary ${
                      navigationMode === "sidebar" ? "active" : ""
                    }`}
                  >
                    {t("navigation.sidebar")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigationModeChange("top")}
                    className={`button-secondary ${
                      navigationMode === "top" ? "active" : ""
                    }`}
                  >
                    {t("navigation.top")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigationModeChange("bottom")}
                    className={`button-secondary ${
                      navigationMode === "bottom" ? "active" : ""
                    }`}
                  >
                    {t("navigation.bottom")}
                  </button>
                </div>
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
      {navigationMode === "bottom" && (
        <BottomNavigation
          currentPage={currentPage}
          onMenuItemClick={handleMenuItemClick}
        />
      )}

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
