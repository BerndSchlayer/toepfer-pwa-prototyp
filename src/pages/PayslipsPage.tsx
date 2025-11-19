import { useMemo, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Clock, Download } from "lucide-react";
import payslipsData from "../data/payslipsData.json";
import "./CommonPage.css";
import "./PayslipsPage.css";

interface PayslipEntry {
  monthOffset: number;
  type: "payslip" | "timesheet";
  document: string;
}

interface ComputedPayslipEntry {
  date: string;
  type: "payslip" | "timesheet";
  document: string;
}

// Hilfsfunktion: Ersten Tag des Monats basierend auf monthOffset berechnen
const getFirstDayOfMonth = (monthOffset: number): Date => {
  const today = new Date();
  const targetMonth = new Date(
    today.getFullYear(),
    today.getMonth() + monthOffset,
    1
  );
  return targetMonth;
};

export default function PayslipsPage() {
  const { t } = useTranslation("app");

  const payslips = useMemo(() => {
    const entries = payslipsData.payslips as PayslipEntry[];
    return entries.map((entry) => {
      const date = getFirstDayOfMonth(entry.monthOffset);
      return {
        date: date.toISOString().split("T")[0],
        type: entry.type,
        document: entry.document,
      } as ComputedPayslipEntry;
    });
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const getDescription = (type: "payslip" | "timesheet"): string => {
    return type === "payslip" ? t("payslips.payslip") : t("payslips.timesheet");
  };

  const getDocumentUrl = (documentPath: string): string => {
    const baseUrl = import.meta.env.BASE_URL;
    return `${baseUrl}${documentPath}`;
  };

  // Aktives PDF für Inline-Anzeige
  const [activePdf, setActivePdf] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [canvases, setCanvases] = useState<string[]>([]);
  const [autoFitWidth, setAutoFitWidth] = useState(true);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const originalViewportMeta = useRef<string | null>(null);
  const renderCountRef = useRef(0);

  // Lade und rendere PDF wenn activePdf oder scale sich ändert
  useEffect(() => {
    const renderPdf = async () => {
      if (!activePdf) {
        setCanvases([]);
        setAutoFitWidth(true);
        setScale(1);
        return;
      }
      console.log(
        "🔄 PDF Render Start - scale:",
        scale,
        "autoFitWidth:",
        autoFitWidth
      );
      const currentRender = ++renderCountRef.current;
      setPdfError(null);
      setPdfLoading(true);
      setCanvases([]);

      try {
        const url = getDocumentUrl(activePdf);
        const pdfjsLib = await import("pdfjs-dist");
        // Worker aus node_modules verwenden (Vite bundelt diesen)
        // @ts-ignore
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

        if (currentRender !== renderCountRef.current) return; // Aborted

        const pageCount = pdf.numPages;
        const tempCanvases: string[] = [];

        // Auto-Fit-Width bei Bedarf berechnen (nur für erste Seite)
        let calculatedScale = scale;
        if (autoFitWidth && pdfContainerRef.current) {
          const firstPage = await pdf.getPage(1);
          const unscaledViewport = firstPage.getViewport({ scale: 1 });
          const containerWidth = pdfContainerRef.current.clientWidth;
          calculatedScale = Math.max(
            0.3,
            Math.min(3, containerWidth / unscaledViewport.width)
          );
          console.log(
            "📏 Auto-Fit-Width calculated:",
            calculatedScale,
            "containerWidth:",
            containerWidth
          );
          // Wichtig: autoFitWidth deaktivieren nach Berechnung, damit manuelle Zooms nicht überschrieben werden
          setAutoFitWidth(false);
          if (Math.abs(calculatedScale - scale) > 0.01) {
            setScale(calculatedScale);
          }
        } else {
          console.log("🎯 Using manual scale:", calculatedScale);
        }

        for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: calculatedScale });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context not available");
          const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
          };
          // @ts-ignore - PDF.js types mismatch mit aktueller Version
          await page.render(renderContext).promise;
          tempCanvases.push(canvas.toDataURL());
        }

        if (currentRender === renderCountRef.current) {
          setCanvases(tempCanvases);
        }
      } catch (err) {
        console.error("PDF render error", err);
        setPdfError(t("payslips.loadError"));
      } finally {
        if (currentRender === renderCountRef.current) {
          setPdfLoading(false);
        }
      }
    };
    renderPdf();
  }, [activePdf, scale, autoFitWidth, t]);

  // Viewport Meta für Pinch-Zoom temporär anpassen
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (activePdf) {
      if (meta) {
        originalViewportMeta.current = meta.getAttribute("content");
        // Entferne user-scalable=no & max-scale=1.0
        const base =
          originalViewportMeta.current ||
          "width=device-width, initial-scale=1.0";
        const updated =
          base
            .replace(/user-scalable=no,?\s*/i, "")
            .replace(/maximum-scale=1\.0,?\s*/i, "") +
          ", maximum-scale=5.0, user-scalable=yes";
        meta.setAttribute("content", updated);
      }
    } else {
      if (meta && originalViewportMeta.current) {
        meta.setAttribute("content", originalViewportMeta.current);
      }
    }
  }, [activePdf]);

  const handleZoomIn = () => {
    console.log("🔍 Zoom In clicked");
    setAutoFitWidth(false);
    setScale((s) => {
      const newScale = s * 1.15;
      console.log("➕ Zoom In: old scale:", s, "new scale:", newScale);
      return newScale;
    });
  };
  const handleZoomOut = () => {
    console.log("🔍 Zoom Out clicked");
    setAutoFitWidth(false);
    setScale((s) => {
      const newScale = Math.max(0.2, s / 1.15);
      console.log("➖ Zoom Out: old scale:", s, "new scale:", newScale);
      return newScale;
    });
  };
  const handleFitWidth = () => {
    console.log("📐 Fit Width clicked");
    setAutoFitWidth(true);
    setScale(1);
  };
  const handleFitPage = () => {
    console.log("📄 Fit Page clicked");
    setAutoFitWidth(false);
    setScale(0.9);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">{t("payslips.title")}</h1>
      </header>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("payslips.date")}</th>
              <th>{t("payslips.description")}</th>
              <th>{t("payslips.document")}</th>
            </tr>
          </thead>
          <tbody>
            {payslips.map((entry, index) => (
              <tr key={index}>
                <td className="date-cell">{formatDate(entry.date)}</td>
                <td className="description-cell">
                  <div className="description-with-icon">
                    {entry.type === "payslip" ? (
                      <FileText size={18} className="file-icon" />
                    ) : (
                      <Clock size={18} className="file-icon" />
                    )}
                    <span>{getDescription(entry.type)}</span>
                  </div>
                </td>
                <td className="document-cell">
                  <button
                    type="button"
                    className="download-button"
                    aria-label={t("payslips.open")}
                    onClick={() => setActivePdf(entry.document)}
                  >
                    <Download size={18} />
                    <span className="download-text">{t("payslips.open")}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {activePdf && (
        <div className="pdf-overlay" role="dialog" aria-modal="true">
          <div className="pdf-toolbar">
            <span className="pdf-title">
              {t("payslips.documentViewerTitle")}
            </span>
            <div className="pdf-controls" aria-label="PDF controls">
              <button
                type="button"
                className="pdf-control-btn"
                onClick={handleZoomOut}
                aria-label={t("payslips.zoomOut")}
              >
                {t("payslips.zoomOut")}
              </button>
              <button
                type="button"
                className="pdf-control-btn"
                onClick={handleZoomIn}
                aria-label={t("payslips.zoomIn")}
              >
                {t("payslips.zoomIn")}
              </button>
              <button
                type="button"
                className="pdf-control-btn"
                onClick={handleFitWidth}
                aria-label={t("payslips.fitWidth")}
              >
                {t("payslips.fitWidth")}
              </button>
              <button
                type="button"
                className="pdf-control-btn"
                onClick={handleFitPage}
                aria-label={t("payslips.fitPage")}
              >
                {t("payslips.fitPage")}
              </button>
              <button
                type="button"
                className="pdf-close-button"
                aria-label={t("payslips.closeDocument")}
                onClick={() => setActivePdf(null)}
              >
                {t("payslips.closeDocument")}
              </button>
            </div>
          </div>
          <div className="pdf-frame-wrapper" ref={pdfContainerRef}>
            {pdfLoading && (
              <div className="pdf-status">{t("payslips.loading")}</div>
            )}
            {pdfError && <div className="pdf-error">{pdfError}</div>}
            {!pdfLoading &&
              !pdfError &&
              canvases.map((dataUrl, idx) => (
                <img
                  key={idx}
                  src={dataUrl}
                  alt={`${t("payslips.documentViewerTitle")} - Page ${idx + 1}`}
                  style={{
                    display: "block",
                    margin: "0 auto 1rem",
                  }}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
