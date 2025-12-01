import { ROSA_BASE_API_PATH } from '@/context/constants';
/** ===========================
 * ✅ Types
 * =========================== */
export type MotiveDto = {
  id: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  color?: string;
  label?: string;
  calendarIds?: string[];
  newPatientDuration?: number;
  existingPatientDuration?: number;
  isBookableOnline?: boolean;
  isSendingNotificationsDisabled?: boolean;
};

export type CalendarDto = {
  id: string;
  siteId?: string;
  hpId?: string;
  label?: string;
  color?: string;
  timezone?: string;
};

export type HpDto = {
  id: string;
  nihii?: string;
  firstName?: string;
  lastName?: string;
};

/** ===========================
 * ✅ Utility: Normalize Payload
 * =========================== */
const normalizeMotivePayload = (m: Partial<MotiveDto>): MotiveDto => ({
  id: String(m.id),
  label: String(m.label || '').trim(),
  color: m.color || '#FFFFFF',
  newPatientDuration: m.newPatientDuration ?? 0,
  existingPatientDuration: m.existingPatientDuration ?? 0,
  isBookableOnline: !!m.isBookableOnline,
  isSendingNotificationsDisabled: !!m.isSendingNotificationsDisabled,
  status: m.status || 'ACTIVE',
  calendarIds: Array.isArray(m.calendarIds) ? m.calendarIds : [],
});

/** ===========================
 * ✅ Motive DTO
 * =========================== */

export type MotiveCreateRequestDto = {
  calendarIds: string[];
  label: string;
  newPatientDuration?: number;
  existingPatientDuration?: number;
  isBookableOnline?: boolean;
  color: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  isSendingNotificationsDisabled?: boolean;
  type?: 'CABINET' | 'VISITES' | 'VIDEO';
};

/** ===========================
 * ✅ Get All Motives
 * =========================== */
export const getAllMotives = async (
  page = 1,
  limit = 20,
  sortField = 'label',
  sortDirection = 1,
) => {
  try {
    const token = localStorage.getItem('rosa_token');

    if (!token) {
      console.warn('⚠️ No token found for getAllMotives()');
      return { data: [], totalCount: 0, totalPages: 0, page: 0 };
    }

    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
      sortField,
      sortDirection: String(sortDirection),
    };

    const query = new URLSearchParams(params).toString();
    const url = `${ROSA_BASE_API_PATH}/motives?${query}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('❌ getAllMotives failed:', res.status, errText);
      return { data: [], totalCount: 0, totalPages: 0, page };
    }

    const json = await res.json();
    return {
      data: json?.elements || [],
      totalCount: json?.totalCount || 0,
      totalPages: json?.totalPages || 1,
      page: json?.page || page,
    };
  } catch (err) {
    console.error('💥 getAllMotives error:', err);
    return { data: [], totalCount: 0, totalPages: 0, page: 0 };
  }
};

/** ===========================
 * ✅ Bulk Update Motives
 * =========================== */
export const updateMotivesBulk = async (payload: any[]) => {
  try {
    const token = localStorage.getItem('rosa_token');

    if (!token) {
      console.warn('⚠️ No token found for updateMotivesBulk');
      return false;
    }

    const res = await fetch(`${ROSA_BASE_API_PATH}/motives/bulk`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('❌ updateMotivesBulk error', res.status, text);
      return false;
    }

    return true;
  } catch (err) {
    console.error('💥 updateMotivesBulk exception', err);
    return false;
  }
};

/** ===========================
 * ✅ Update Single Motive
 * =========================== */
export const updateSingleMotive = async (id: string, body: Partial<MotiveDto>) => {
  try {
    const token = localStorage.getItem('rosa_token');

    if (!token) {
      console.warn('⚠️ No token found for updateSingleMotive');
      return false;
    }

    const normalized = normalizeMotivePayload({ id, ...body });

    const res = await fetch(`${ROSA_BASE_API_PATH}/motives/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalized),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`❌ updateSingleMotive failed [${res.status}]:`, text);
      return false;
    }

    return true;
  } catch (err) {
    console.error('💥 updateSingleMotive exception', err);
    return false;
  }
};

/** ===========================
 * ✅ Get All Calendars
 * =========================== */
export const getAllCalendars = async (
  page = 1,
  limit = 50,
  sortField = 'label',
  sortDirection = 1,
  search?: string,
) => {
  try {
    const token = localStorage.getItem('rosa_token');

    if (!token) {
      console.warn('⚠️ No token found for getAllCalendars()');
      return { elements: [], totalCount: 0, totalPages: 0, page };
    }

    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
      sortField,
      sortDirection: String(sortDirection),
      ...(search ? { searchText: search } : {}),
    };

    const query = new URLSearchParams(params).toString();
    const url = `${ROSA_BASE_API_PATH}/calendars?${query}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('❌ getAllCalendars failed:', res.status, text);
      return { elements: [], totalCount: 0, totalPages: 0, page };
    }

    const json = await res.json();
    return json;
  } catch (err) {
    console.error('💥 getAllCalendars error:', err);
    return { elements: [], totalCount: 0, totalPages: 0, page: 0 };
  }
};

/** ===========================
 * ✅ Get All Hps
 * =========================== */
export const getAllHps = async (
  page = 1,
  limit = 50,
  sortField = 'firstName',
  sortDirection = 1,
  search?: string,
) => {
  try {
    const token = localStorage.getItem('rosa_token');

    if (!token) {
      console.warn('⚠️ No token found for getAllHps()');
      return { elements: [], totalCount: 0, totalPages: 0, page };
    }

    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
      sortField,
      sortDirection: String(sortDirection),
      ...(search ? { searchText: search } : {}),
    };

    const query = new URLSearchParams(params).toString();
    const url = `${ROSA_BASE_API_PATH}/hps?${query}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('❌ getAllHps failed:', res.status, text);
      return { elements: [], totalCount: 0, totalPages: 0, page };
    }

    const json = await res.json();
    return json;
  } catch (err) {
    console.error('💥 getAllHps error:', err);
    return { elements: [], totalCount: 0, totalPages: 0, page: 0 };
  }
};

/** ===========================
 * ✅ Create New Motive
 * =========================== */
export const createMotive = async (payload: MotiveCreateRequestDto) => {
  try {
    const token = localStorage.getItem('rosa_token');

    if (!token) {
      console.warn('⚠️ No token found for createMotive()');
      return { success: false, message: 'No authentication token found.' };
    }

    // The API expects an array for bulk creation
    const res = await fetch(`${ROSA_BASE_API_PATH}/motives/bulk`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([payload]),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('❌ createMotive failed:', res.status, text);
      return {
        success: false,
        message: `Erreur lors de la création du motif (${res.status})`,
      };
    }

    return { success: true };
  } catch (err) {
    console.error('💥 createMotive exception:', err);
    return {
      success: false,
      message: 'Erreur réseau : impossible de créer le motif.',
    };
  }
};
