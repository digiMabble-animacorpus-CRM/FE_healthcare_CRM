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
        setError(err.message || "Failed to load sites");
      } finally {
        setLoading(false);
      }
    };
    loadSites();
  }, []);

  if (loading) return <p>Loading sites...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🏥 All Sites</h2>
      {sites.length === 0 ? (
        <p>No sites found.</p>
      ) : (
        <ul>
          {sites.map((site) => (
            <li key={site.id} style={{ marginBottom: "10px" }}>
              <strong>{site.name}</strong>
              {site.address && (
                <>
                  <br />
                  Address: {site.address.street} {site.address.number},{" "}
                  {site.address.city}, {site.address.zipCode}, {site.address.country}
                </>
              )}
              {site.contactInfos && site.contactInfos.length > 0 && (
                <>
                  <br />
                  Contact: {site.contactInfos[0].value}
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
