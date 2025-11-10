"use client";

import { useEffect, useState } from "react";
import { CalendarEvent } from "./types";
import { getAllEvents } from "./api";

const EventsPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const res = await getAllEvents(1, 10);
        setEvents(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📅 Events List</h2>
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <strong>{event.title}</strong> — {event.type} ({event.status})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventsPage;
