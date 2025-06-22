// hooks/useGmailEmails.ts
import { useEffect, useState } from 'react';

interface Email {
  subject: string;
  from: string;
  snippet: string;
}

export function useGmailEmails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await fetch('./api/gmail'); // We'll define this next
        const data = await res.json();
        setEmails(data);
      } catch (err) {
        console.error('Error fetching Gmail emails:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  return { emails, loading };
}
