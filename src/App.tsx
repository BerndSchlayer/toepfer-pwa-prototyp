function App() {
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
            Hier entsteht Schritt für Schritt der Prototyp. Die Anwendung wird
            später als installierbare PWA auf mobilen Geräten nutzbar sein.
          </p>
        </section>

        <section>
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
        </section>
      </main>
    </div>
  );
}

export default App;
