"use client";

import { useEffect, useState } from "react";
import { Site } from "./types";
import { getAllSites } from "./api";

const SitesPage = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSites = async () => {
      try {
        setLoading(true);
        const res = await getAllSites(1, 10);
        setSites(res.data);
      } catch (err: any) {
        setError(err.message || "Échec du chargement des sites");
      } finally {
        setLoading(false);
      }
    };
    loadSites();
  }, []);

  if (loading) return <p>Chargement des sites…</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🏥 Tous les sites</h2>
      {sites.length === 0 ? (
        <p>Aucun site trouvé.</p>
      ) : (
        <ul>
          {sites.map((site) => (
            <li key={site.id} style={{ marginBottom: "10px" }}>
              <strong>{site.name}</strong>
              {site.address && (
                <>
                  <br />
                  Adresse : {site.address.street} {site.address.number},{" "}
                  {site.address.city}, {site.address.zipCode}, {site.address.country}
                </>
              )}
              {site.contactInfos && site.contactInfos.length > 0 && (
                <>
                  <br />
                  Contact : {site.contactInfos[0].value}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SitesPage;
