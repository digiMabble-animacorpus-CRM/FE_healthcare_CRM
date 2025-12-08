'use client';

import { API_BASE_PATH, ROSA_BASE_API_PATH } from '@/context/constants';
import { getSignal } from '@/lib/apiAbort';
import { decryptAES } from '@/utils/encryption';
export interface PatientUpdatePayload {
  name?: string;
  email?: string;
  phoneNumber?: string;
  roleId?: number;
  accessLevel?: 'patient' | 'branch-admin' | 'super-admin';
  branches?: number[];
  selectedBranch?: number | null;
  permissions?: {
    action: string;
    resource: string;
    enabled: boolean;
  }[];
  updatedBy?: {
    patientId: string;
    updatedAt: string;
  }[];
  [key: string]: any;
}

export const getAllPatient = async (
  page: number = 1,
  limit: number = 10,
): Promise<{ data: any[]; totalCount: number; totalPage: number; page: number }> => {
  try {
    const token = localStorage.getItem('rosa_token');

    if (!token) {
      console.warn('No access token found.');
      return { data: [], totalCount: 0, totalPage: 0, page: 0 };
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString();

    const response = await fetch(`${ROSA_BASE_API_PATH}/patients?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: getSignal()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return { data: [], totalCount: 0, totalPage: 0, page: 0 };
    }

    const jsonData = await response.json();
    console.log(jsonData);

    const patientData = Array.isArray(jsonData?.elements) ? jsonData.elements : [];

    return {
      data: patientData,
      totalCount: jsonData?.totalCount || 0,
      totalPage: jsonData?.totalPages || 0,
      page: jsonData?.page || 0,
    };
  } catch (error) {
    console.error('Error fetching patient:', error);
    return { data: [], totalCount: 0, totalPage: 0, page: 0 };
  }
};

export const getPatientById = async (patientId: any): Promise<any | null> => {
  const token = localStorage.getItem('rosa_token');

  if (!token) {
    console.warn('No access token found.');
    return null;
  }

  try {
    const response = await fetch(`${ROSA_BASE_API_PATH}/patients/${patientId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: getSignal()
    });

    const result = await response.json();
    console.log(result, 'single patient');
    if (!response.ok) {
      console.error('Failed to fetch patient:', 'Unknown error');
      return null;
    }

    if (result) {
      return result;
    }

    console.warn('No data found in response.');
    return null;
  } catch (error) {
    console.error('Exception during patient fetch:', error);
    return null;
  }
};

// 🔹 Helper to fetch motives and return as { [id]: label }
const fetchMotivesMap = async (): Promise<Record<string, string>> => {
  const ROSA_TOKEN = localStorage.getItem('rosa_token');

  try {
    const res = await fetch(
      `${ROSA_BASE_API_PATH}/motives?limit=100&sortField=label&sortDirection=1`,
      {
        headers: {
          Authorization: `Bearer ${ROSA_TOKEN}`,
          'Content-Type': 'application/json',
        },
        signal: getSignal()
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error('Failed to fetch motives');
    const map: Record<string, string> = {};
    data?.elements?.forEach((m: any) => {
      map[m.id] = m.label || '—';
    });
    return map;
  } catch (err) {
    console.error('❌ Error fetching motives:', err);
    return {};
  }
};

// 🔹 Helper to fetch calendars and return as { [id]: label }
const fetchCalendarsMap = async (): Promise<Record<string, string>> => {
  const ROSA_TOKEN = localStorage.getItem('rosa_token');

  try {
    const res = await fetch(
      `${ROSA_BASE_API_PATH}/calendars?limit=100&sortField=label&sortDirection=1`,
      {
        headers: {
          Authorization: `Bearer ${ROSA_TOKEN}`,
          'Content-Type': 'application/json',
        },
        signal: getSignal()
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error('Failed to fetch calendars');
    const map: Record<string, string> = {};
    data?.elements?.forEach((c: any) => {
      map[c.id] = c.label || '—';
    });
    return map;
  } catch (err) {
    console.error('❌ Error fetching calendars:', err);
    return {};
  }
};

export const getPatientEvents = async (
  patientId: string,
  page: number = 1,
  limit: number = 10,
): Promise<any> => {
  const token = localStorage.getItem('rosa_token');

  if (!token) {
    console.warn('No access token found.');
    return { elements: [], totalCount: 0 };
  }

  try {
    // 🔹 Build event URL
    const url = new URL(`${ROSA_BASE_API_PATH}/events`);
    url.searchParams.append('patientRecordId', patientId);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('sortField', 'startAt');
    url.searchParams.append('sortDirection', '1');

    // 🔹 Fetch events + meta data (calendars & motives) in parallel
    const [eventsRes, motivesMap, calendarsMap] = await Promise.all([
      fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: getSignal()
      }),
      fetchMotivesMap(),
      fetchCalendarsMap(),
    ]);

    const result = await eventsRes.json();

    if (!eventsRes.ok) {
      console.error('Failed to fetch events:', result?.message || 'Unknown error');
      return { elements: [], totalCount: 0 };
    }

    if (!Array.isArray(result.elements)) {
      console.warn('No elements found in event response.');
      return { elements: [], totalCount: 0 };
    }

    // 🔹 Enrich events with motive & calendar labels
    const enriched = result.elements.map((e: any) => ({
      ...e,
      motiveLabel: motivesMap[e.motiveId] || '—',
      calendarLabel: calendarsMap[e.calendarId] || '—',
    }));
    return { ...result, elements: enriched };
  } catch (error) {
    console.error('Exception during events fetch:', error);
    return { elements: [], totalCount: 0 };
  }
};

export const updateEventNote = async (eventId: string, hpNote: string): Promise<boolean> => {
  const token = localStorage.getItem('rosa_token');

  if (!token) {
    console.warn('No access token found.');
    return false;
  }
  console.log(eventId, 'eventId');
  try {
    const payload = [
      {
        id: eventId,
        hpNote,
      },
    ];

    const response = await fetch(`${ROSA_BASE_API_PATH}/events/bulk`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: getSignal()
    });
    console.log(response, 'updste');
    if (!response.ok) {
      console.error('❌ Failed to update event note');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Exception updating note:', error);
    return false;
  }
};

export const findPatient = async (value: string): Promise<any | null> => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.warn('No access token found.');
    return null;
  }

  const url = `${API_BASE_PATH}/patients/find/${encodeURIComponent(value)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch patient:', result?.message || 'Unknown error');
      return null;
    }

    return result?.data || null;
  } catch (error) {
    console.error('Exception during patient find:', error);
    return null;
  }
};

export const createPatient = async (payload: any): Promise<boolean> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    const safePayload = {
      ...payload,
      // branches: (payload.branches || []).map((b: string | number) => Number(b)),
      // selected_branch: payload.selected_branch ? Number(payload.selected_branch) : null,
    };

    // // Build payload directly from form/input
    // const safePayload = {
    //   firstname: 'John',
    //   middlename: 'Middle',
    //   lastname: 'Doe',
    //   ssin: '94060768059',
    //   legalgender: 'M',
    //   language: 'en',
    //   primarypatientrecordid: 'primary_record_123',
    //   note: 'Some note about the patient',
    //   status: 'ACTIVE',
    //   mutualitynumber: '12345',
    //   mutualityregistrationnumber: '67890',
    //   emails: 'john.doe@example.com',
    //   country: 'BE',
    //   city: 'Brussels',
    //   street: 'Rue du Comté',
    //   number: '10',
    //   zipcode: '5140',
    //   birthdate: '1994-06-07',
    //   phones: ['+32491079736'],
    // };

    const response = await fetch(`${API_BASE_PATH}/patients`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(safePayload), //  send plain payload
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      console.error('Create patient failed:', result.message || 'Unknown error');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating patient:', error);
    return false;
  }
};

export const updatePatient = async (
  id: string | number,
  payload: PatientUpdatePayload,
): Promise<boolean> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    const safePayload = {
      ...payload,
    };

    const response = await fetch(`${API_BASE_PATH}/patients/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(safePayload), // ✅ send raw payload
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      console.error('Update failed:', result.message || 'Unknown error');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating patient:', error);
    return false;
  }
};

export const transformToBackendDto = (formData: any): PatientUpdatePayload => {
  return {
    name: formData.name,
    email: formData.email,
    phone_number: formData.phoneNumber,
    role_id: formData.roleId ? Number(formData.roleId) : undefined,
    access_level: formData.accessLevelId as 'patient' | 'branch-admin' | 'super-admin',
    branches: formData.branches.map((b: { id: any }) => Number(b.id)).filter(Boolean),
    selected_branch: formData.selectedBranch ? Number(formData.selectedBranch) : null,
    permissions: formData.permissions.map((p: { _id: string; enabled: any }) => ({
      action: p._id.split('-')[0],
      resource: p._id.split('-')[1],
      enabled: !!p.enabled,
    })),
    updatedBy: [
      {
        patientId: String(localStorage.getItem('patient_id') || ''),
        updatedAt: new Date().toISOString(),
      },
    ],
  };
};

export const deletePatient = async (id: string | number, externalId: any): Promise<boolean> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    const response = await fetch(`${API_BASE_PATH}/patients?ids=${id}&externalIds=${externalId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      console.error('Delete failed:', result.message || 'Unknown error');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting patient:', error);
    return false;
  }
};

export const getAllRoles = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return [];

    const response = await fetch(`${API_BASE_PATH}/patient-role?tag=Role`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const encryptedText = await response.text();
    const decrypted = decryptAES(encryptedText);

    return Array.isArray(decrypted?.data) ? decrypted.data : [];
  } catch (error) {
    console.error(' Error fetching roles:', error);
    return [];
  }
};

export const getAllAccessLevels = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return [];

    const response = await fetch(`${API_BASE_PATH}/patient-role?tag=AccessLevel`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const encryptedText = await response.text();
    const decrypted = decryptAES(encryptedText);

    return Array.isArray(decrypted?.data) ? decrypted.data : [];
  } catch (error) {
    console.error(' Error fetching access levels:', error);
    return [];
  }
};
