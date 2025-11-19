import { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Home,
  Umbrella,
} from "lucide-react";
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

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const navigationRef = useRef<HTMLDivElement>(null);

  // Native passive touch events für bessere Performance
  useEffect(() => {
    const element = navigationRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const swipeThreshold = 50;
      const diff = touchStartX.current - touchEndX.current;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && currentWeekIndex < weeks.length - 1) {
          goToNextWeek();
        } else if (diff < 0 && currentWeekIndex > 0) {
          goToPreviousWeek();
        }
      }
    };

    // Passive Event Listener für bessere Scroll-Performance
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentWeekIndex, weeks.length]);

  const isToday = (dateString: string): boolean => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getCardClass = (day: (typeof currentWeek.days)[0]): string => {
    const classes = ["schedule-card"];

    if (isToday(day.date)) {
      classes.push("is-today");
    } else if (day.entries.some((e) => e.type === "vacation")) {
      classes.push("is-vacation");
    } else if (day.entries.every((e) => e.type === "free")) {
      classes.push("is-free");
    }

    return classes.join(" ");
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">{t("schedule.title")}</h1>
      </header>

      <div ref={navigationRef} className="week-navigation">
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

      <div className="schedule-cards">
        {currentWeek.days.map((day) => (
          <div key={day.date} className={getCardClass(day)}>
            <div className="card-header">
              <div className="card-day">
                <span className="day-name-card">
                  {t(`schedule.days.${day.dayOfWeek}`)}
                </span>
                <span className="date-badge">{formatDate(day.date)}</span>
              </div>
              {isToday(day.date) && (
                <span className="today-badge">{t("schedule.today")}</span>
              )}
            </div>
            <div className="card-content">
              {day.entries.map((entry, index) => (
                <div key={index} className="schedule-entry">
                  {entry.type === "work" ? (
                    <>
                      <Clock size={18} className="entry-icon" />
                      <span className="entry-time">
                        {entry.timeFrom} - {entry.timeTo}
                      </span>
                      <MapPin size={16} className="entry-icon" />
                      <span className="entry-location">{entry.department}</span>
                    </>
                  ) : entry.type === "free" ? (
                    <>
                      <Home size={18} className="entry-icon" />
                      <span className="entry-status status-free">
                        {t("schedule.free")}
                      </span>
                    </>
                  ) : (
                    <>
                      <Umbrella size={18} className="entry-icon" />
                      <span className="entry-status status-vacation">
                        {t("schedule.vacation")}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
