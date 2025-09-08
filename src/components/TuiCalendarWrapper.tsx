'use client';

import { useRef, useCallback, useImperativeHandle } from 'react';
import Calendar from '@toast-ui/react-calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import React from 'react';

// Define the interface for the ref methods
interface CalendarHandle {
  setDate: (date: Date) => void;
}

// Define the component props, including the forwarded ref
interface TuiCalendarProps {
  [x: string]: any; // Allow any additional props
  date?: Date | string; // Optional date prop
}

// Use React.forwardRef to forward the ref to the component
const TuiCalendar = ({ date, ...restProps }: TuiCalendarProps, ref: React.Ref<CalendarHandle>) => {
  const calendarRef = useRef<any>(null); // Ref for the Calendar instance

  // Expose setDate function to the parent via the ref
  useImperativeHandle(ref, () => ({
    setDate: (newDate: Date) => {
      if (calendarRef.current) {
        const calendarInstance = calendarRef.current.getInstance();
        console.log(newDate)
        calendarInstance.setDate(newDate);
        calendarInstance.render(); 
      }
    },
  }));

  const handleClickNextButton = useCallback(() => {
    if (calendarRef.current) {
      const calendarInstance = calendarRef.current.getInstance();
      const currentDate = calendarInstance.getDate();
      const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

      // Use the date prop if provided, otherwise use nextMonthDate
      calendarInstance.setDate(date ? new Date(date) : nextMonthDate);
      calendarInstance.render(); // Ensure re-render
    }
  }, [date]);

  return (
    <div>
      <Calendar ref={calendarRef} {...restProps} />
    </div>
  );
};

// Export with forwardRef
export default React.forwardRef(TuiCalendar);