'use client';

import { API_BASE_PATH } from '@/context/constants';
import { encryptAES, decryptAES } from '@/utils/encryption';
import type { StaffType, StaffRoleType } from '@/types/data';

export interface StaffUpdatePayload {
  name?: string;
  email?: string;
  phone_number?: string;
  role_id?: number;
  access_level?: 'staff' | 'branch-admin' | 'super-admin';
  branches?: number[];
  selected_branch?: number | null;
  permissions?: {
    action: string;
    resource: string;
    enabled: boolean;
  }[];
  updatedBy?: {
    staffId: string;
    updatedAt: string;
  }[];
  [key: string]: any;
}

export const getAllStaff = async (
  page: number = 1,
  limit: number = 10,
  branch?: string,
  from?: string,
  to?: string,
  search?: string
): Promise<{ data: StaffType[]; totalCount: number }> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn(' No access token found.');
      return { data: [], totalCount: 0 };
    }

    const filters: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      ...(branch ? { branch } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(search ? { search } : {}),
    };

    console.log(' Filters:', filters);
    const encrypted = encryptAES(filters);
    console.log(' Encrypted filters:', encrypted);

    const response = await fetch(
      `${API_BASE_PATH}/staff?data=${encodeURIComponent(encrypted)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(' Backend error:', response.status, errorText);
      return { data: [], totalCount: 0 };
    }

    const encryptedText = await response.text();
    console.log('Encrypted response from server:', encryptedText);

    const decrypted = decryptAES(encryptedText);
    console.log(' Decrypted response:', decrypted);

    const staffData: StaffType[] = Array.isArray(decrypted?.data)
      ? decrypted.data
      : decrypted?.data
      ? [decrypted.data]
      : [];

    return {
      data: staffData,
      totalCount: decrypted?.total || 0,
    };
  } catch (error) {
    console.error(' Error fetching staff:', error);
    return { data: [], totalCount: 0 };
  }
};


export const getStaffById = async (staffId: string): Promise<StaffType | null> => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    console.warn(" No access token found.");
    return null;
  }

  const url = `${API_BASE_PATH}/staff/${encodeURIComponent(staffId)}`;
  console.log(" Requesting staff by ID:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(" Response status:", response.status);
    const result = await response.json();
    console.log(" Full API response:", result);

    if (!response.ok) {
      console.error("Failed to fetch staff:", result?.message || "Unknown error");
      return null;
    }

    const encryptedData = result?.data;
    if (!encryptedData) {
      console.error(" No data found in response.");
      return null;
    }

    //  Check if it's already decrypted
    if (typeof encryptedData === "object") {
      console.log(" Staff data already decrypted:", encryptedData);
      return encryptedData as StaffType;
    }

    //  If still string, decrypt it
    const decryptedData = decryptAES(encryptedData);
    if (!decryptedData) {
      throw new Error("Decryption returned empty string");
    }

    console.log(" Decrypted Staff Data:", decryptedData);
    return decryptedData as StaffType;

  } catch (error) {
    console.error(" Exception during staff fetch:", error);
    return null;
  }
};


export const updateStaff = async (
  id: string | number,
  payload: StaffUpdatePayload
): Promise<boolean> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    const safePayload = {
      ...payload,
      branches: (payload.branches || []).map((b: string | number) => Number(b)),
      selected_branch: payload.selected_branch
        ? Number(payload.selected_branch)
        : null,
    };

    const encryptedId = encryptAES(String(id));
    const encryptedPayload = encryptAES(safePayload);

    const response = await fetch(
      `${API_BASE_PATH}/staff/${encodeURIComponent(encryptedId)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: encryptedPayload }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.status) {
      console.error(' Update failed:', result.message || 'Unknown error');
      return false;
    }

    return true;
  } catch (error) {
    console.error(' Error updating staff:', error);
    return false;
  }
};


export const transformToBackendDto = (formData: StaffType): StaffUpdatePayload => {
  return {
    name: formData.name,
    email: formData.email,
    phone_number: formData.phoneNumber,
    role_id: formData.roleId ? Number(formData.roleId) : undefined,
    access_level: formData.accessLevelId as 'staff' | 'branch-admin' | 'super-admin',
    branches: formData.branches.map((b) => Number(b.id)).filter(Boolean),
    selected_branch: formData.selectedBranch ? Number(formData.selectedBranch) : null,
    permissions: formData.permissions.map((p) => ({
      action: p._id.split('-')[0],
      resource: p._id.split('-')[1],
      enabled: !!p.enabled,
    })),
    updatedBy: [
      {
        staffId: String(localStorage.getItem('staff_id') || ''),
        updatedAt: new Date().toISOString(),
      },
    ],
  };
};



export const getAllRoles = async (): Promise<StaffRoleType[]> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return [];

    const response = await fetch(`${API_BASE_PATH}/staff-role?tag=Role`, {
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

export const getAllAccessLevels = async (): Promise<StaffRoleType[]> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return [];

    const response = await fetch(`${API_BASE_PATH}/staff-role?tag=AccessLevel`, {
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
