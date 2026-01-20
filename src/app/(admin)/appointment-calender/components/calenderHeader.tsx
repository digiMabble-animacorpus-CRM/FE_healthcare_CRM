'use client';

import React, { useMemo } from 'react';
import { Button, ButtonGroup, Form, Row, Col } from 'react-bootstrap';

interface CalendarHeaderProps {
  selectedDate: Date;
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
  // 🔥 RESPONSIVE DATE LABEL LOGIC
  // ----------------------------------------------------
  const displayLabel = useMemo(() => {
    const d = new Date(selectedDate);

    if (view === 'day') {
      const today = new Date();
      const isToday = d.toDateString() === today.toDateString();

      return isToday
        ? `Aujourd’hui — ${d.toLocaleDateString([], {
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

    if (view === 'week') {
      const start = new Date(d);
      start.setDate(start.getDate() - start.getDay());

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

    if (view === 'month') {
      return d.toLocaleDateString([], {
        month: 'long',
        year: 'numeric',
      });
    }

    return '';
  }, [selectedDate, view]);

  return (
    <div className="mb-3 p-3 bg-white rounded shadow-sm">
      <Row className="g-3 align-items-center">
        {/* LEFT — Navigation Buttons */}
        <Col xs={12} md="auto" className="text-center text-md-start">
          <ButtonGroup>
            <Button variant="outline-secondary" onClick={onPrev}>
              ◀
            </Button>
            <Button variant="outline-secondary" onClick={onToday}>
              Aujourd’hui
            </Button>
            <Button variant="outline-secondary" onClick={onNext}>
              ▶
            </Button>
          </ButtonGroup>
        </Col>

        {/* CENTER — Label */}
        <Col xs={12} md className="text-center fw-bold fs-5">
          {displayLabel}
        </Col>

        {/* RIGHT — View Select */}
        <Col xs={12} md="auto" className="text-center text-md-end">
          <Form.Select
            value={view}
            onChange={(e) => onViewChange(e.target.value as any)}
            style={{ maxWidth: 180 }}
            className="mx-auto mx-md-0"
          >
            <option value="day">Vue jour</option>
            <option value="week">Vue semaine</option>
            <option value="month">Vue mois</option>
          </Form.Select>
        </Col>
      </Row>
    </div>
  );
};

export default CalendarHeader;
