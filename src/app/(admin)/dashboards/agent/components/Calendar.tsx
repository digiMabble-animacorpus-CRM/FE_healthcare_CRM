'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { type DateClickArg, type DropArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import { Spinner, Alert } from 'react-bootstrap';

import { getCalendarAppointments, CalendarAppointment } from '@/helpers/dashboard'; // Adjust path

import type { CalendarProps } from '@/types/component-props';
import type { EventClickArg, EventDropArg } from '@fullcalendar/core/index.js';

const Calendar = ({
  events,
  onDateClick,
  onDrop,
  onEventClick,
  onEventDrop,
}: CalendarProps) => {
  const handleDateClick = (arg: DateClickArg) => {
    onDateClick(arg);
  };
  const handleEventClick = (arg: EventClickArg) => {
    onEventClick(arg);
  };
  const handleDrop = (arg: DropArg) => {
    onDrop(arg);
  };
  const handleEventDrop = (arg: EventDropArg) => {
    onEventDrop(arg);
  };

  return (
    <div className="mt-4 mt-lg-0">
      <div id="calendar">
        <FullCalendar
          initialView="dayGridMonth"
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin, bootstrapPlugin]}
          themeSystem="bootstrap"
          bootstrapFontAwesome={false}
          handleWindowResize={true}
          slotDuration="00:15:00"
          slotMinTime="08:00:00"
          slotMaxTime="19:00:00"
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            list: 'List',
            prev: 'Prev',
            next: 'Next',
          }}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
          }}
          dayMaxEventRows={1}
          editable={true}
          selectable={true}
          droppable={true}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          drop={handleDrop}
          eventDrop={handleEventDrop}
        />
      </div>
    </div>
  );
};

const CalendarContainer = () => {
  const [events, setEvents] = useState<CalendarAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Example query parameters - adjust or source from state/context as needed
  const params = {
    startDate: '2025-09-01T00:00:00Z',
    endDate: '2025-09-30T23:59:59Z',
    doctorId: 1,
    branchId: 1,
    timeFilter: 'thisWeek',
  };

  useEffect(() => {
  async function fetchAppointments() {
    setLoading(true);
    setError(null);
    try {
      const data = await getCalendarAppointments(params);
      if (data && data.appointments) {
        const eventsWithStringIds = data.appointments.map(event => ({
          ...event,
          id: String(event.id),
        }));
        setEvents(eventsWithStringIds);
      } else {
        setError('No appointments found.');
      }
    } catch (err) {
      setError('Failed to load appointments.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  fetchAppointments();
}, []);


  // Handlers for calendar interactions
  const handleDateClick = (arg: DateClickArg) => {
    console.log('Date clicked:', arg.dateStr);
  };

  const handleEventClick = (arg: EventClickArg) => {
    console.log('Event clicked:', arg.event);
  };

  const handleDrop = (arg: DropArg) => {
    console.log('Drop:', arg);
  };

  const handleEventDrop = (arg: EventDropArg) => {
    console.log('Event dropped:', arg.event);
    // Implement event update logic here if needed
  };

  if (loading) {
    return <Spinner animation="border" className="m-3" />;
  }

  if (error) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }

  return (
    <Calendar
      events={events}
      onDateClick={handleDateClick}
      onEventClick={handleEventClick}
      onDrop={handleDrop}
      onEventDrop={handleEventDrop}
    />
  );
};

export default CalendarContainer;
