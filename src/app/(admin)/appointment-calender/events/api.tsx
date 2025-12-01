import { ROSA_BASE_API_PATH } from '@/context/constants';
import { CalendarEvent } from './types';

export const getAllEvents = async (
  page: number = 1,
  limit: number = 10,
  from?: string,
  to?: string,
  calendarId?: string,
  patientRecordId?: string,
): Promise<{ data: CalendarEvent[]; totalCount: number; totalPage: number; page: number }> => {
  try {
    const token = localStorage.getItem('rosa_token');
    if (!token) {
      console.warn('No access token found.');
      return { data: [], totalCount: 0, totalPage: 0, page: 0 };
    }

    const filters: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(calendarId ? { calendarId } : {}),
      ...(patientRecordId ? { patientRecordId } : {}),
    };

    const queryParams = new URLSearchParams(filters).toString();

    const response = await fetch(`${ROSA_BASE_API_PATH}/events?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return { data: [], totalCount: 0, totalPage: 0, page: 0 };
    }

    const jsonData = await response.json();
    return {
      data: jsonData?.elements || [],
      totalCount: jsonData?.totalCount || 0,
      totalPage: jsonData?.totalPages || 0,
      page: jsonData?.page || 1,
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { data: [], totalCount: 0, totalPage: 0, page: 0 };
  }
};
