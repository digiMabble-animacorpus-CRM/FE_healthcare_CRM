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
        setError(err.message || "Échec du chargement des calendriers");
      } finally {
        setLoading(false);
      }
    };
    loadCalendars();
  }, []);

  if (loading) return <p>Chargement des calendriers…</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🗓 Tous les calendriers</h2>
      {calendars.length === 0 ? (
        <p>Aucun calendrier trouvé.</p>
      ) : (
        <ul>
          {calendars.map((calendar) => (
            <li key={calendar.id} style={{ marginBottom: "8px" }}>
              <strong>{calendar.label}</strong>
              <br />
              ID du site : {calendar.siteId} <br />
              ID du professionnel de santé : {calendar.hpId} <br />
              Couleur :{" "}
              <span style={{ color: calendar.color }}>{calendar.color}</span>{" "}
              <br />
              Fuseau horaire : {calendar.timezone}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CalendarsPage;
