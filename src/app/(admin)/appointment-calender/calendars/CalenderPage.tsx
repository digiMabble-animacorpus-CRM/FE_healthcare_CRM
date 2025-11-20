"use client";

import { useEffect, useState } from "react";
import { Calendar } from "./types";
import { getAllCalendars } from "./api";

const CalendarsPage = () => {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCalendars = async () => {
      try {
        setLoading(true);
        const res = await getAllCalendars(1, 10);
        setCalendars(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load calendars");
      } finally {
        setLoading(false);
      }
    };
    loadCalendars();
  }, []);

  if (loading) return <p>Loading calendars...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🗓 All Calendars</h2>
      {calendars.length === 0 ? (
        <p>No calendars found.</p>
      ) : (
        <ul>
          {calendars.map((calendar) => (
            <li key={calendar.id} style={{ marginBottom: "8px" }}>
              <strong>{calendar.label}</strong>
              <br />
              Site ID: {calendar.siteId} <br />
              HP ID: {calendar.hpId} <br />
              Color: <span style={{ color: calendar.color }}>{calendar.color}</span> <br />
              Timezone: {calendar.timezone}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CalendarsPage;
