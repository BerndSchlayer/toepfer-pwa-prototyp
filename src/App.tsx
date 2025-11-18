import { useEffect, useState } from "react";

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

    alert("Die Installation wird von diesem Browser nicht unterstützt.");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: "1.5rem",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundColor: "#f5f5f5",
      }}
    >
      <main
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "2rem",
          borderRadius: "1rem",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        }}
      >
        <header style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.8rem", margin: 0 }}>
            Toepfer PWA Prototyp
          </h1>
          <p style={{ marginTop: "0.5rem", color: "#555" }}>
            Diese App dient als Prototyp für eine progressive Web App auf React
            Basis.
          </p>
        </header>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>
            Startseite
          </h2>
          <p style={{ marginBottom: "0.75rem", color: "#444" }}>
            Hier entsteht Schritt für Schritt der Prototyp. Die Anwendung kann
            als App auf dem Gerät installiert werden.
          </p>
        </section>

        <section
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "0.75rem",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 500,
              backgroundColor: "#2563eb",
              color: "#ffffff",
            }}
            onClick={() => {
              alert("Hier könnte später eine Funktion starten.");
            }}
          >
            Beispiel Aktion
          </button>

          <button
            type="button"
            onClick={handleInstallClick}
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "0.75rem",
              border: "1px solid #2563eb",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 500,
              backgroundColor: "#ffffff",
              color: "#2563eb",
              opacity: showInstallButton || (isIos && !isStandalone) ? 1 : 0.6,
            }}
          >
            App installieren
          </button>
        </section>
      </main>

      {isIos && !isStandalone && showIosHint && (
        <div
          style={{
            position: "fixed",
            left: "1rem",
            right: "1rem",
            bottom: "1rem",
            padding: "1rem",
            borderRadius: "0.75rem",
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.18)",
          }}
        >
          <p style={{ margin: 0, marginBottom: "0.5rem", color: "#333" }}>
            Um diese App zu installieren, öffne das Teilen Symbol in Safari und
            wähle &quot;Zum Home Bildschirm&quot;.
          </p>
          <button
            type="button"
            onClick={() => setShowIosHint(false)}
            style={{
              marginTop: "0.5rem",
              padding: "0.4rem 0.9rem",
              borderRadius: "0.6rem",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
              backgroundColor: "#e5e7eb",
              color: "#111827",
            }}
          >
            Hinweis schließen
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
