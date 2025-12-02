// helpers/eventApi.ts
import { ROSA_BASE_API_PATH } from '@/context/constants';

/** Safe JSON fallback */
async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

/** -----------------------------
 *  GET EVENT BY ID
 *  GET /events/:id
 * ----------------------------- */
export const getEventById = async (id: string) => {
  const ROSA_TOKEN = localStorage.getItem('rosa_token');
  if (!id) return null;

  try {
    const res = await fetch(`${ROSA_BASE_API_PATH}/events/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ROSA_TOKEN}`,
      },
    });

    if (!res.ok) return null;
    return await safeJson(res);
  } catch (err) {
    console.error('getEventById error:', err);
    return null;
  }
};

/** -----------------------------
 *  CREATE EVENTS (BULK)
 *  POST /events/bulk
 * ----------------------------- */
export const createEventBulk = async (payload: any[]) => {
  const ROSA_TOKEN = localStorage.getItem('rosa_token');

  try {
    const res = await fetch(`${ROSA_BASE_API_PATH}/events/bulk`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ROSA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await safeJson(res);

    if (!res.ok) {
      return { success: false, message: json?.message || 'Create event failed' };
    }

    return { success: true, data: json };
  } catch (err) {
    return { success: false, message: 'Network error during event create' };
  }
};

/** -----------------------------
 *  UPDATE EVENTS (BULK)
 *  PATCH /events/bulk
 * ----------------------------- */
export const updateEventBulk = async (payload: any[]) => {
  const ROSA_TOKEN = localStorage.getItem('rosa_token');

  try {
    const res = await fetch(`${ROSA_BASE_API_PATH}/events/bulk`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${ROSA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await safeJson(res);

    if (!res.ok) {
      return { success: false, message: json?.message || 'Event update failed' };
    }

    return { success: true, data: json };
  } catch (err) {
    return { success: false, message: 'Network error during event update' };
  }
};

/** -----------------------------
 *  GET MULTIPLE EVENTS
 *  (Used by dashboard)
 *
 *  GET /events?startAt=&endAt=&limit=&page=
 * ----------------------------- */
export const getAllEvents = async (
  page: number = 1,
  limit: number = 200,
  startAt?: string,
  endAt?: string,
): Promise<{ data: any[]; totalCount: number; totalPages: number; page: number }> => {
  const ROSA_TOKEN = localStorage.getItem('rosa_token');

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (startAt) params.append('startAt', startAt);
    if (endAt) params.append('endAt', endAt);

    const url = `${ROSA_BASE_API_PATH}/events?${params.toString()}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ROSA_TOKEN}`,
      },
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('Error fetching events:', txt);
      return { data: [], totalCount: 0, totalPages: 0, page: 0 };
    }

    const json = await res.json();
    const list = Array.isArray(json?.elements) ? json.elements : [];

    return {
      data: list,
      totalCount: json?.totalCount || 0,
      totalPages: json?.totalPages || 0,
      page: json?.page || 0,
    };
  } catch (err) {
    console.error('getAllEvents error:', err);
    return { data: [], totalCount: 0, totalPages: 0, page: 0 };
  }
};

/** -----------------------------
 *  DELETE EVENT (optional)
 *  DELETE /events?ids=
 * ----------------------------- */
export const deleteEvent = async (id: string) => {
  const ROSA_TOKEN = localStorage.getItem('rosa_token');

  try {
    if (!id) return { success: false, message: 'Invalid event ID' };

    const params = new URLSearchParams({ ids: id });

    const res = await fetch(`${ROSA_BASE_API_PATH}/events?${params.toString()}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${ROSA_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await safeJson(res);

    if (!res.ok) {
      return { success: false, message: json?.message || 'Event delete failed' };
    }

    return { success: true, data: json };
  } catch (err) {
    return { success: false, message: 'Network error during event delete' };
  }
};

export default {
  getEventById,
  createEventBulk,
  updateEventBulk,
  getAllEvents,
  deleteEvent,
};
