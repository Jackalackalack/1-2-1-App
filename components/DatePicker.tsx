"use client";

import { useState } from "react";

type Props = {
  availableDayKeys: Set<string>;
  selectedDayKey: string | null;
  onSelectDay: (dayKey: string) => void;
};

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export default function DatePicker({ availableDayKeys, selectedDayKey, onSelectDay }: Props) {
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()));

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = viewMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const canGoPrev = startOfMonth(viewMonth) > startOfMonth(new Date());

  return (
    <div className="date-picker">
      <div className="date-picker-header">
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, -1))}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          &lsaquo;
        </button>
        <span>{monthLabel}</span>
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          aria-label="Next month"
        >
          &rsaquo;
        </button>
      </div>

      <div className="date-picker-weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>

      <div className="date-picker-grid">
        {cells.map((date, i) => {
          if (!date) return <span key={i} className="date-cell empty" aria-hidden="true" />;
          const dayKey = date.toDateString();
          const hasSlots = availableDayKeys.has(dayKey);
          return (
            <button
              key={i}
              type="button"
              className="date-cell"
              data-available={hasSlots}
              data-selected={dayKey === selectedDayKey}
              disabled={!hasSlots}
              onClick={() => onSelectDay(dayKey)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
