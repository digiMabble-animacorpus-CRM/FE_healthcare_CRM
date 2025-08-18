'use client';

import { API_BASE_PATH } from '@/context/constants';
import { encryptAES, decryptAES } from '@/utils/encryption';
import type { TeamMemberCreatePayload, TeamMemberType } from '@/types/data';

export interface TeamMemberUpdatePayload {
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
    staffId: string;
    updatedAt: string;
  }[];
  [key: string]: any;
}

export const getAllTeamMembers = async (
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

    const response = await fetch(`${API_BASE_PATH}/team-members?${queryParams}`, {
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
    console.error('Error fetching team members:', error);
    return { data: [], totalCount: 0 };
  }
};

export const getTeamMemberById = async (therapistId: any): Promise<TeamMemberType | null> => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.warn('No access token found.');
    return null;
  }

  const url = `${API_BASE_PATH}/team-members/${therapistId}`;
  console.log('Requesting team members by ID:', url);

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
      console.error('Failed to fetch team members:', result?.message || 'Unknown error');
      return null;
    }

    // Return the team members data directly
    if (result) {
      return result as TeamMemberType;
    }

    console.warn('No data found in response.');
    return null;
  } catch (error) {
    console.error('Exception during team members fetch:', error);
    return null;
  }
};

export const createTeamMember = async (payload: TeamMemberCreatePayload): Promise<boolean> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    const safePayload = {
      ...payload,
      branches: (payload.branches || []).map((b: any) => Number(b)),
      selected_branch: payload.selected_branch ? Number(payload.selected_branch) : null,
    };

    const encryptedPayload = encryptAES(safePayload);

    const response = await fetch(`${API_BASE_PATH}/team-members`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: encryptedPayload }),
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      console.error('Create failed:', result.message || 'Unknown error');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating team members:', error);
    return false;
  }
};

export const updateTeamMember = async (
  id: string | number,
  payload: TeamMemberUpdatePayload,
): Promise<boolean> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    const safePayload = {
      ...payload,
      branches: (payload.branches || []).map((b: string | number) => Number(b)),
      selected_branch: payload.selected_branch ? Number(payload.selected_branch) : null,
    };

    const encryptedId = encryptAES(String(id));
    const encryptedPayload = encryptAES(safePayload);

    const response = await fetch(`${API_BASE_PATH}/team-members/${encodeURIComponent(encryptedId)}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: encryptedPayload }),
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      console.error(' Update failed:', result.message || 'Unknown error');
      return false;
    }

    return true;
  } catch (error) {
    console.error(' Error updating team members:', error);
    return false;
  }
};

export const transformToBackendDto = (formData: TeamMemberType): TeamMemberUpdatePayload => {
  return {
    id: String(formData.idPro),
    full_name: formData.fullName,
    first_name: formData.firstName,
    last_name: formData.lastName,
    job_title: formData.jobTitle,
    about_me: formData.aboutMe,
    specializations: formData.specializations
      ? formData.specializations.split('\n').map((s: string) => s.trim())
      : [],
    contact: {
      email: formData.contactEmail,
      phone: formData.contactPhone,
    },
    center: {
      address: formData.centerAddress,
      email: formData.centerEmail,
      phone: formData.centerPhoneNumber,
    },
    schedule: formData.schedule,
    website: formData.website,
    availability: formData.availability || null,
    languages: formData.spokenLanguages
      ? formData.spokenLanguages.split(',').map((lang: string) => lang.trim())
      : [],
    payment_methods: formData.paymentMethods
      ? formData.paymentMethods.split(/\r?\n|,/).map((p: string) => p.trim())
      : [],
    agenda_links: formData.agendaLinks || null,
    rosa_link: formData.rosaLink || null,
    google_agenda_link: formData.googleAgendaLink || null,
    updatedBy: [
      {
        staffId: String(localStorage.getItem('staff_id') || ''),
        updatedAt: new Date().toISOString(),
      },
    ],
  };
};

export const getAllRoles = async (): Promise<any[]> => {
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

export const getAllAccessLevels = async (): Promise<any[]> => {
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
