'use client';

import { API_BASE_PATH } from '@/context/constants';
import { decryptAES } from '@/utils/encryption';
// import type { TherapistCreatePayload, TherapistType } from '@/types/data';
export interface TherapistUpdatePayload {
  name?: string;
  email?: string;
  phoneNumber?: string;
  roleId?: number;
  accessLevel?: 'staff' | 'branch-admin' | 'super-admin';
  branches?: number[];
  selectedBranch?: number | null;
  permissions?: {
    action: string;
    resource: string;
    enabled: boolean;
  }[];
  updatedBy?: {
    therapistId: string;
    updatedAt: string;
  }[];
  [key: string]: any;
}

export const getAllTherapists = async (
  page: number = 1,
  limit: number = 10,
  branch?: string,
  from?: string,
  to?: string,
  search?: string,
): Promise<{ data: any[]; totalCount: number }> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No access token found.');
      return { data: [], totalCount: 0 };
    }

    const filters: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      ...(branch ? { branch } : {}),
      ...(from ? { fromDate: from } : {}),
      ...(to ? { toDate: to } : {}),
      ...(search ? { searchText: search } : {}),
    };
    console.log('Filters (plain):', filters);

    const queryParams = new URLSearchParams(filters).toString();

    const response = await fetch(`${API_BASE_PATH}/therapists?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return { data: [], totalCount: 0 };
    }

    const jsonData = await response.json();
    console.log('Response from server:', jsonData);

    const therapistData: any[] = Array.isArray(jsonData) ? jsonData : jsonData ? [jsonData] : [];

    return {
      data: therapistData,
      totalCount: jsonData?.totalCount || 0,
    };
  } catch (error) {
    console.error('Error fetching patient:', error);
    return { data: [], totalCount: 0 };
  }
};

export const getTherapistById = async (therapistId: any): Promise<any | null> => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.warn('No access token found.');
    return null;
  }

  const url = `${API_BASE_PATH}/therapists/${therapistId}`;
  console.log('Requesting therapist by ID:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Full API response:', result);

    if (!response.ok) {
      console.error('Failed to fetch therapist:', result?.message || 'Unknown error');
      return null;
    }

    return result ?? null;
  } catch (error) {
    console.error('Exception during therapist fetch:', error);
    return null;
  }
};

export const createTherapist = async (payload: any): Promise<boolean> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    const safePayload = {
      ...payload,
    };

    const response = await fetch(`${API_BASE_PATH}/therapists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(safePayload), // plain payload
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      console.error('Create therapist failed:', result.message || 'Unknown error');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating therapist:', error);
    return false;
  }
};

export const updateTherapist = async (
  id: string | number,
  payload: TherapistUpdatePayload,
): Promise<boolean> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    const safePayload = {
      ...payload,
    };

    const response = await fetch(`${API_BASE_PATH}/therapists/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(safePayload),
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      console.error('Update failed:', result.message || 'Unknown error');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating therapist:', error);
    return false;
  }
};

export const transformToBackendDto = (formData: any): TherapistUpdatePayload => {
  return {
    name: formData.name,
    email: formData.email,
    phoneNumber: formData.phoneNumber,
    roleId: formData.roleId ? Number(formData.roleId) : undefined,
    accessLevel: formData.accessLevelId,
    branches: formData.branches.map((b: { id: any }) => Number(b.id)).filter(Boolean),
    selectedBranch: formData.selectedBranch ? Number(formData.selectedBranch) : null,
    permissions: formData.permissions.map((p: { _id: string; enabled: any }) => ({
      action: p._id.split('-')[0],
      resource: p._id.split('-')[1],
      enabled: !!p.enabled,
    })),
    updatedBy: [
      {
        therapistId: String(localStorage.getItem('therapist_id') || ''),
        updatedAt: new Date().toISOString(),
      },
    ],
  };
};
// export const deleteTherapist = async (id: string | number): Promise<boolean> => {
//   try {
//     const token = localStorage.getItem('access_token');
//     if (!token) return false;

//     const response = await fetch(`${API_BASE_PATH}/therapists/${id}`, {
//       method: 'DELETE',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     const result = await response.json();

//     if (!response.ok || !result.status) {
//       console.error('Delete failed:', result.message || 'Unknown error');
//       return false;
//     }

//     return true;
//   } catch (error) {
//     console.error('Error deleting therapist:', error);
//     return false;
//   }
// };
import axios from 'axios';
export const deleteTherapist = async (id: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  try {
    await axios.delete(`${API_BASE_PATH}/therapists/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return true;
  } catch (err) {
    console.error('Delete therapist error:', err);
    return false;
  }
};

export const getAllRoles = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return [];

    const response = await fetch(`${API_BASE_PATH}/therapist-role?tag=Role`, {
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

    const response = await fetch(`${API_BASE_PATH}/therapist-role?tag=AccessLevel`, {
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
export interface TherapistType {
  id: string;
  firstname: string;
  lastname: string;
  email?: string;
  phone?: string;
  branch?: string;
  status?: string;

  // New fields
  jobTitle?: string;
  aboutMe?: string;
  languages?: string[];
  tags?: string[];
}
