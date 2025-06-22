// lib/gmail.ts

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

export const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

// Generate OAuth2 URL
export function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

// Get token from auth code
export async function getTokenFromCode(code: string): Promise<any> {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

// Set credentials manually
export function setCredentials(tokens: {
  access_token?: string;
  refresh_token?: string;
}) {
  oauth2Client.setCredentials(tokens);
}

// Fetch list of emails
export async function fetchEmails(): Promise<
  { subject: string; from: string; snippet: string }[]
> {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 5,
  });

  const messages = res.data.messages || [];
  const emailData: { subject: string; from: string; snippet: string }[] = [];

  for (const message of messages) {
    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: message.id || '',
    });

    const headers = msg.data.payload?.headers || [];
    const subject =
      headers.find((h) => h.name === 'Subject')?.value || 'No Subject';
    const from = headers.find((h) => h.name === 'From')?.value || 'Unknown';
    const snippet = msg.data.snippet || '';

    emailData.push({ subject, from, snippet });
  }

  return emailData;
}
