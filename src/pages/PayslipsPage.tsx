import { useMemo } from "react";
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

  const handleDocumentClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    documentPath: string
  ) => {
    e.preventDefault();
    const url = getDocumentUrl(documentPath);

    console.log("Opening PDF:", url);
    console.log("User Agent:", navigator.userAgent);
    console.log("Is Standalone:", (window.navigator as any).standalone);

    // Für iOS PWA: Verwende window.location.href
    // Das ist die zuverlässigste Methode
    try {
      window.location.href = url;
    } catch (error) {
      console.error("Error opening PDF:", error);
      alert(`Fehler beim Öffnen: ${url}`);
    }
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
                  <a
                    href={getDocumentUrl(entry.document)}
                    onClick={(e) => handleDocumentClick(e, entry.document)}
                    className="download-button"
                    aria-label={t("payslips.download")}
                  >
                    <Download size={18} />
                    <span className="download-text">
                      {t("payslips.download")}
                    </span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
