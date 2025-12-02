"use client";

import React, { useState } from "react";
import Calendar, { CalendarProps } from "react-calendar";
import { Modal, Button, Card } from "react-bootstrap";
import "react-calendar/dist/Calendar.css";

interface MiniCalendarProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ selectedDate, onChange }) => {
  const [showModal, setShowModal] = useState(false);

  const handleDateSelect: CalendarProps["onChange"] = (value) => {
    if (value instanceof Date) {
      onChange(value);
      setShowModal(false);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      onChange(value[0]);
      setShowModal(false);
    }
  };

  return (
    <>
      {/* 🖥 DESKTOP SIDEBAR CALENDAR */}
      <div className="d-none d-lg-block">
        <Card className="shadow-sm border-0 p-3">
          <Calendar
            onChange={handleDateSelect}
            value={selectedDate}
            view="month"
            showNeighboringMonth={false}
            className="w-100"
          />
        </Card>
      </div>

      {/* 📱 MOBILE/TABLET BUTTON */}
      <div className="d-lg-none mt-2">
        <Button
          variant="outline-primary"
          className="w-100 py-2"
          onClick={() => setShowModal(true)}
        >
          Calender 📅
        </Button>
      </div>

      {/* 📱 SIMPLE CENTERED MODAL (NOT FULLSCREEN) */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        backdrop={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Date</Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-3 d-flex justify-content-center">
          <Calendar
            onChange={handleDateSelect}
            value={selectedDate}
            view="month"
            showNeighboringMonth={false}
            className="w-100"
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default MiniCalendar;
