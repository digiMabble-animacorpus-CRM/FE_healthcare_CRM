"use client";

import { useEffect, useState } from "react";
import { getAllPatients } from "./api";
import { Patient } from "./types";

const PatientsPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const res = await getAllPatients(1, 10);
        setPatients(res.data);
      } catch (err: any) {
        setError(err.message || "Échec du chargement des patients");
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  if (loading) return <p>Chargement des patients…</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🧍 Tous les patients</h2>
      {patients.length === 0 ? (
        <p>Aucun patient trouvé.</p>
      ) : (
        <ul>
          {patients.map((p) => (
            <li key={p.id} style={{ marginBottom: "10px" }}>
              <strong>
                {p.firstName} {p.lastName}
              </strong>{" "}
              {p.legalGender ? `(${p.legalGender})` : ""}
              <br />
              {p.address
                ? `${p.address.street || ""} ${p.address.number || ""}, ${p.address.city}`
                : "Aucune adresse fournie"}
              <br />
              {p.contactInfos && p.contactInfos.length > 0 && (
                <>📧 {p.contactInfos[0].value}</>
              )}
              {p.note && (
                <>
                  <br />
                  📝 Note : {p.note}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientsPage;
