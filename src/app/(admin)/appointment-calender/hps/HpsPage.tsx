"use client";

import { useEffect, useState } from "react";
import { getAllHps } from "./api";
import { HealthProfessional } from "./types";

const HpsPage = () => {
  const [hps, setHps] = useState<HealthProfessional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHps = async () => {
      try {
        setLoading(true);
        const res = await getAllHps(1, 10);
        setHps(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load health professionals");
      } finally {
        setLoading(false);
      }
    };
    loadHps();
  }, []);

  if (loading) return <p>Loading health professionals...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>👩‍⚕️ All Health Professionals</h2>
      {hps.length === 0 ? (
        <p>No health professionals found.</p>
      ) : (
        <ul>
          {hps.map((hp) => (
            <li key={hp.id} style={{ marginBottom: "8px" }}>
              <strong>
                {hp.firstName} {hp.lastName}
              </strong>
              <br />
              NIHI: {hp.nihii}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HpsPage;
