// helpers/patientApi.ts

import { ROSA_BASE_API_PATH, ROSA_TOKEN } from "@/context/constants";


type PatientRecordDto = any; // you can replace with your strict Rosa schema

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export const getPatientById = async (id: string) => {
  if (!id) return null;

  try {
    const res = await fetch(`${ROSA_BASE_API_PATH}/patients/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${ROSA_TOKEN}` },
    });

    if (!res.ok) return null;

    return await safeJson(res);
  } catch (err) {
    console.error('getPatientById error', err);
    return null;
  }
};

export const createPatientBulk = async (payload: PatientRecordDto[]) => {
  try {
    const res = await fetch(`${ROSA_BASE_API_PATH}/patients/bulk`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ROSA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await safeJson(res);

    if (!res.ok) {
      return { success: false, message: json?.message || 'Create failed' };
    }

    return { success: true, data: json };
  } catch (err) {
    return { success: false, message: 'Network error during create' };
  }
};

export const updatePatientBulk = async (payload: PatientRecordDto[]) => {
  try {
    const res = await fetch(`${ROSA_BASE_API_PATH}/patients/bulk`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${ROSA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await safeJson(res);

    if (!res.ok) {
      return { success: false, message: json?.message || 'Update failed' };
    }

    return { success: true, data: json };
  } catch (err) {
    return { success: false, message: 'Network error during update' };
  }
};

export const deletePatient = async (
  id?: string,
  externalId?: string
) => {
  try {
    const token = ROSA_TOKEN;
    if (!token) return { success: false, message: "Missing token" };

    const query = new URLSearchParams();

    if (id) query.append("ids", id);
    if (externalId) query.append("externalIds", externalId);

    const url = `${ROSA_BASE_API_PATH}/patients?${query.toString()}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const json = await safeJson(res);

    if (!res.ok) {
      return { success: false, message: json?.message || "Delete failed" };
    }

    return { success: true, data: json };
  } catch (error) {
    return { success: false, message: "Network error during delete" };
  }
};

export const getAllPatient = async (
  page: number = 1,
  limit: number = 10,
): Promise<{ data: any[]; totalCount: number; totalPage: number; page: number }> => {
  try {
    const token = ROSA_TOKEN;
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

export default {
  getPatientById,
  createPatientBulk,
  updatePatientBulk,
  deletePatient,
  getAllPatient,
};
