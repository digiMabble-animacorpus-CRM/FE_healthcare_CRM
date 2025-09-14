'use client';

import { API_BASE_PATH } from '@/context/constants';
import type { TeamMemberCreatePayload, TeamMemberType } from '@/types/data';
import { decryptAES } from '@/utils/encryption';

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

    const teamData: any[] = Array.isArray(jsonData) ? jsonData : jsonData ? [jsonData] : [];

    return {
      data: teamData,
      totalCount: jsonData?.totalCount || 0,
    };
  } catch (error) {
    console.error('Error fetching team members:', error);
    return { data: [], totalCount: 0 };
  }
};

export const getTeamMemberById = async (team_member_id: any): Promise<TeamMemberType | null> => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.warn('No access token found.');
    return null;
  }

  const url = `${API_BASE_PATH}/team-members/${team_member_id}`;
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
      branches: (payload.branches || []).map((b: string | number) => Number(b)),
      selected_branch: payload.selected_branch ? Number(payload.selected_branch) : null,
    };

    const response = await fetch(`${API_BASE_PATH}/team-members`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(safePayload), // send plain JSON payload
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      console.error('Create team member failed:', result.message || 'Unknown error');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating team member:', error);
    return false;
  }
};

export const updateTeamMember = async (
  id: string | number,
  payload: TeamMemberCreatePayload,
): Promise<boolean> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    const safePayload = {
      ...payload,
      branches: (payload.branches || []).map((b: string | number) => Number(b)),
      selected_branch: payload.selected_branch ? Number(payload.selected_branch) : null,
    };

    const response = await fetch(
      `${API_BASE_PATH}/team-members/${encodeURIComponent(String(id))}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(safePayload), // sending plain JSON without encryption
      },
    );

    const result = await response.json();

    if (!response.ok || !result.status) {
      console.error('Update failed:', result.message || 'Unknown error');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating team members:', error);
    return false;
  }
};

export const transformToBackendDto = (formData: TeamMemberType): TeamMemberCreatePayload => {
  console.log('Input formData to transformToBackendDto:', formData);

  const BRANCHES = [
    { id: 1, name: 'Gembloux - Orneau' },
    { id: 2, name: 'Gembloux - Tout Vent' },
    { id: 3, name: 'Namur' },
  ];

  const status: 'active' | 'inactive' =
    formData.status && (formData.status === 'active' || formData.status === 'inactive')
      ? formData.status
      : 'active'; // or some default

  const primaryBranchId =
    typeof formData.primary_branch_id === 'number' ? formData.primary_branch_id : BRANCHES[0].id;

  const parsedPermissions: Record<string, any> =
    typeof formData.permissions === 'string'
      ? JSON.parse(formData.permissions)
      : formData.permissions || {};

  return {
    teamId: String(formData.team_id || ''),
    fullName: formData.full_name,
    firstName: formData.first_name,
    lastName: formData.last_name,
    job1: formData.job_1,
    job2: formData.job_2,
    job3: formData.job_3,
    job4: formData.job_4,
    specificAudience: formData.specific_audience,
    whoAmI: formData.who_am_i ?? '',
    specialization1: formData.specialization_1,
    specializations: Array.isArray(formData.specializations)
      ? formData.specializations.filter((s): s is string => typeof s === 'string')
      : [],
    consultations: formData.consultations,
    officeAddress: formData.office_address,
    contactEmail: formData.contact_email,
    contactPhone: formData.contact_phone,
    schedule: formData.schedule,
    about: formData.about,
    website: formData.website,
    languagesSpoken: formData.languages_spoken,
    paymentMethods: formData.payment_methods,
    diplomasAndTraining: formData.diplomas_and_training,
    frequentlyAskedQuestions:
      typeof formData.frequently_asked_questions === 'string'
        ? formData.frequently_asked_questions
        : formData.frequently_asked_questions
          ? JSON.stringify(formData.frequently_asked_questions)
          : null,
    calendarLinks: formData.calendar_links,
    photo: formData.photo,
    branches: Array.isArray(formData.branch_ids)
      ? formData.branch_ids.map((b) => (typeof b === 'string' ? Number(b) : b))
      : [],
    selected_branch: formData.primary_branch_id,
    role: formData.role || '',
    status: status,
    primaryBranchId: primaryBranchId,
    permissions: parsedPermissions,
    createdByRole: formData.created_by_role || 'admin',
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
