'use client';

import dynamic from 'next/dynamic';

// Dynamically import the calendar component with SSR disabled
const AppointmentCalendar = dynamic(() => import('./AppointmentCalender'), {
  ssr: false,
  loading: () => <div>Chargement du calendrier…</div>
});

export default function AppointmentCalendarPage() {
  return <AppointmentCalendar />;
}