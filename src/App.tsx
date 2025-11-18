import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "./components/Header";
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

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleMenuItemClick = (item: string) => {
    alert(`Menüpunkt geklickt: ${item}`);
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
      <main className="app-main">
        <section className="app-section">
          <h2 className="app-section-title">{t("homepageTitle")}</h2>
          <p className="app-section-text">{t("homepageText")}</p>
        </section>

        <section className="button-container">
          <button
            type="button"
            className="button-primary"
            onClick={() => {
              alert(t("exampleActionAlert"));
            }}
          >
            {t("exampleAction")}
          </button>

          <button
            type="button"
            onClick={handleInstallClick}
            className={`button-secondary ${
              showInstallButton || (isIos && !isStandalone) ? "" : "disabled"
            }`}
          >
            {t("installApp")}
          </button>
        </section>
      </main>

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
