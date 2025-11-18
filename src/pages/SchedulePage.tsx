import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import scheduleData from "../data/scheduleData.json";
import "./CommonPage.css";
import "./SchedulePage.css";

interface ScheduleEntry {
  type: "work" | "free" | "vacation";
  timeFrom?: string;
  timeTo?: string;
  department?: string;
}

interface ScheduleDay {
  dayOfWeek: string;
  entries: ScheduleEntry[];
}

interface WeekDataTemplate {
  weekOffset: number;
  days: ScheduleDay[];
}

// Hilfsfunktion: ISO-Wochennummer berechnen
const getISOWeek = (date: Date): { weekNumber: number; year: number } => {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  const weekNumber =
    1 +
    Math.round(
      ((tempDate.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    );
  return { weekNumber, year: tempDate.getFullYear() };
};

// Hilfsfunktion: Montag einer bestimmten Woche berechnen
const getMondayOfWeek = (weekOffset: number): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  // Berechne Montag dieser Woche (0=Sonntag, 1=Montag, ...)
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + daysToMonday + weekOffset * 7);
  return monday;
};

// Hilfsfunktion: Datum für einen bestimmten Wochentag berechnen
const getDateForDayOfWeek = (monday: Date, dayOfWeek: string): Date => {
  const dayMap: { [key: string]: number } = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
  };
  const offset = dayMap[dayOfWeek] || 0;
  const date = new Date(monday);
  date.setDate(monday.getDate() + offset);
  return date;
};

export default function SchedulePage() {
  const { t } = useTranslation("app");
  const [currentWeekIndex, setCurrentWeekIndex] = useState(
    scheduleData.weeks.findIndex((w) => w.weekOffset === 0)
  );

  const weeks = useMemo(() => {
    const templates = scheduleData.weeks as WeekDataTemplate[];
    return templates.map((template) => {
      const monday = getMondayOfWeek(template.weekOffset);
      const { weekNumber, year } = getISOWeek(monday);

      const daysWithDates = template.days.map((day) => {
        const date = getDateForDayOfWeek(monday, day.dayOfWeek);
        return {
          dayOfWeek: day.dayOfWeek,
          date: date.toISOString().split("T")[0],
          entries: day.entries,
        };
      });

      return {
        weekNumber,
        year,
        days: daysWithDates,
      };
    });
  }, []);

  const currentWeek = weeks[currentWeekIndex];

  const goToPreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  const goToNextWeek = () => {
    if (currentWeekIndex < weeks.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const renderEntry = (entry: ScheduleEntry): string => {
    if (entry.type === "free") {
      return t("schedule.free");
    }
    if (entry.type === "vacation") {
      return t("schedule.vacation");
    }
    return `${entry.timeFrom} - ${entry.timeTo}: ${entry.department}`;
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">{t("schedule.title")}</h1>
      </header>

      <div className="week-navigation">
        <button
          type="button"
          onClick={goToPreviousWeek}
          disabled={currentWeekIndex === 0}
          className="week-nav-button"
          aria-label={t("schedule.previousWeek")}
        >
          <ChevronLeft size={20} />
        </button>
        <span className="week-label">
          {t("schedule.weekLabel")} {currentWeek.weekNumber} /{" "}
          {currentWeek.year}
        </span>
        <button
          type="button"
          onClick={goToNextWeek}
          disabled={currentWeekIndex === weeks.length - 1}
          className="week-nav-button"
          aria-label={t("schedule.nextWeek")}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("schedule.dayOfWeek")}</th>
              <th>{t("schedule.date")}</th>
              <th>{t("schedule.description")}</th>
            </tr>
          </thead>
          <tbody>
            {currentWeek.days.map((day) => (
              <tr key={day.date}>
                <td className="day-name">
                  {t(`schedule.days.${day.dayOfWeek}`)}
                </td>
                <td className="date-cell">{formatDate(day.date)}</td>
                <td className="description-cell">
                  {day.entries.map((entry, index) => (
                    <div key={index} className={`entry entry-${entry.type}`}>
                      {renderEntry(entry)}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
