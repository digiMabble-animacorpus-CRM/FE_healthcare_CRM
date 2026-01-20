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
        setError(err.message || "Échec du chargement des événements");
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  if (loading) return <p>Chargement des événements…</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📅 Liste des événements</h2>
      {events.length === 0 ? (
        <p>Aucun événement trouvé.</p>
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
