'use client';

import { API_BASE_PATH } from '@/context/constants';
import { encryptAES, decryptAES } from '@/utils/encryption';

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
      ...(from ? { fromDate: from } : {}), // match backend param name
      ...(to ? { toDate: to } : {}),
      ...(search ? { searchText: search } : {}),
    };

    console.log('Filters (plain):', filters);

    const queryParams = new URLSearchParams(filters).toString();

    const response = await fetch(`${API_BASE_PATH}/customers?${queryParams}`, {
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

    const patientData: any[] = Array.isArray(jsonData?.data)
      ? jsonData.data
      : jsonData?.data
        ? [jsonData.data]
        : [];

    return {
      data: patientData,
      totalCount: jsonData?.totalCount || 0,
    };
  } catch (error) {
    console.error('Error fetching patient:', error);
    return { data: [], totalCount: 0 };
  }
};

export const getPatientById = async (patientId: any): Promise<any | null> => {
  console.log(patientId);
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.warn('No access token found.');
    return null;
  }

  const url = `${API_BASE_PATH}/customers/${patientId}`;
  console.log('Requesting patient by ID:', url);

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
      console.error('Failed to fetch patient:', result?.message || 'Unknown error');
      return null;
    }

    // Directly return the patient data
    if (result?.data) {
      return result.data as any;
    }

    console.warn('No data found in response.');
    return null;
  } catch (error) {
    console.error('Exception during patient fetch:', error);
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

    const response = await fetch(`${API_BASE_PATH}/customers`, {
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

  //  console.log("PATCH URL:", `${API_BASE_PATH}/customers/${id}`);
   // console.log("PATCH BODY:", JSON.stringify(safePayload, null, 2));

    const response = await fetch(`${API_BASE_PATH}/customers/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(safePayload), // ✅ send raw payload
    });

    const result = await response.json();
   // console.log("Update response:", result);

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
