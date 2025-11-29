'use client';

import React, { useMemo } from 'react';
import { Button, ButtonGroup, Form } from 'react-bootstrap';

interface CalendarHeaderProps {
  selectedDate: Date; // 👈 NEW
  view: 'day' | 'week' | 'month';
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (v: 'day' | 'week' | 'month') => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  selectedDate,
  view,
  onPrev,
  onNext,
  onToday,
  onViewChange,
}) => {
  // ----------------------------------------------------
  // 📌 FORMAT THE LABEL BASED ON VIEW
  // ----------------------------------------------------
  const displayLabel = useMemo(() => {
    const d = new Date(selectedDate);

    // --- DAY VIEW ---
    if (view === 'day') {
      const today = new Date();
      const isToday = d.toDateString() === today.toDateString();

      return isToday
        ? `Today — ${d.toLocaleDateString([], {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}`
        : d.toLocaleDateString([], {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
    }

    // --- WEEK VIEW ---
    if (view === 'week') {
      const start = new Date(d);
      start.setDate(start.getDate() - start.getDay()); // Sunday

      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      const startStr = start.toLocaleDateString([], {
        day: 'numeric',
        month: 'short',
      });

      const endStr = end.toLocaleDateString([], {
        day: 'numeric',
        month: 'short',
        year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined,
      });

      return `${startStr} — ${endStr}`;
    }

    // --- MONTH VIEW ---
    if (view === 'month') {
      return d.toLocaleDateString([], {
        month: 'long',
        year: 'numeric',
      });
    }

    return '';
  }, [selectedDate, view]);

  return (
    <div className="d-flex align-items-center justify-content-between mb-3 p-2 bg-light rounded shadow-sm">
      {/* LEFT BUTTONS */}
      <ButtonGroup>
        <Button variant="outline-secondary" onClick={onPrev}>
          ◀
        </Button>
        <Button variant="outline-secondary" onClick={onToday}>
          Today
        </Button>
        <Button variant="outline-secondary" onClick={onNext}>
          ▶
        </Button>
      </ButtonGroup>

      {/* CENTER LABEL */}
      <div className="flex-grow-1 text-center fw-bold fs-5" style={{ userSelect: 'none' }}>
        {displayLabel}
      </div>

      {/* VIEW SELECT */}
      <Form.Select
        value={view}
        onChange={(e) => onViewChange(e.target.value as any)}
        style={{ width: 150 }}
      >
        <option value="day">Day View</option>
        <option value="week">Week View</option>
        <option value="month">Month View</option>
      </Form.Select>
    </div>
  );
};

export default CalendarHeader;
