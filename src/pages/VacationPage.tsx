import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import "./CommonPage.css";
import "./VacationPage.css";

export default function VacationPage() {
  const { t } = useTranslation("app");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simuliere API-Aufruf
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Zeige Erfolgsmeldung
    alert(t("vacation.successMessage"));

    // Formular zurücksetzen
    setDateFrom("");
    setDateTo("");
    setRemarks("");
    setIsSubmitting(false);
  };

  const isFormValid = dateFrom && dateTo && dateFrom <= dateTo;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">{t("vacation.title")}</h1>
      </header>

      <div className="vacation-form-container">
        <form onSubmit={handleSubmit} className="vacation-form">
          <div className="form-group">
            <input
              type="date"
              id="dateFrom"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="form-input"
              placeholder=" "
              required
            />
            <label htmlFor="dateFrom" className="form-label">
              {t("vacation.dateFrom")}
            </label>
          </div>

          <div className="form-group">
            <input
              type="date"
              id="dateTo"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="form-input"
              placeholder=" "
              required
              min={dateFrom}
            />
            <label htmlFor="dateTo" className="form-label">
              {t("vacation.dateTo")}
            </label>
          </div>

          <div className="form-group">
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="form-input form-textarea"
              placeholder=" "
              rows={4}
            />
            <label htmlFor="remarks" className="form-label">
              {t("vacation.remarks")}
            </label>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={!isFormValid || isSubmitting}
          >
            <Send size={18} />
            <span>
              {isSubmitting
                ? t("vacation.sending")
                : t("vacation.submitButton")}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
