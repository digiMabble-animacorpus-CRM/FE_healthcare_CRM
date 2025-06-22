// pages/api/gmail.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchEmails, setCredentials } from '@/lib/gmail';

// Ideally get from session or DB; for demo, hardcoded
const mockTokens = {
  access_token: process.env.GMAIL_ACCESS_TOKEN,
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    setCredentials(mockTokens);
    const emails = await fetchEmails();
    res.status(200).json(emails);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Gmail emails' });
  }
}
