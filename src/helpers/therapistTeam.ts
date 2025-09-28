'use client';

import { TherapistTeamMember } from '@/app/(admin)/therapist-team/add-TherapistTeam/components/AddTherapistTeam';
import { API_BASE_PATH } from '@/context/constants';
import { decryptAES } from '@/utils/encryption';

// Fetch all therapist team members with revised query mapping
export const 
getAllTherapistTeamMembers = async (
  page: number = 1,
  limit: number = 10,
  branch?: string,
  from?: string,
  to?: string,
  search?: string,
): Promise<{ data: TherapistTeamMember[]; totalCount: number }> => {
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
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_PATH}/therapist-team?${queryParams}`, {
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
    const teamData: TherapistTeamMember[] = Array.isArray(jsonData?.data) ? jsonData.data : [];
    return {
      data: teamData,
      totalCount: jsonData?.totalCount || 0,
    };
  } catch (error) {
    console.error('Error fetching team members:', error);
    return { data: [], totalCount: 0 };
  }
};

// Fetch a therapist team member by ID
export const getTherapistTeamMemberById = async (teamMemberId: string | number): Promise<TherapistTeamMember | null> => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.warn('No access token found.');
    return null;
  }
  const url = `${API_BASE_PATH}/therapist-team/${teamMemberId}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const err = await response.text();
      console.error('Failed to fetch therapist:', err);
      return null;
    }
    const result = await response.json();
    return result ? result as TherapistTeamMember : null;
  } catch (error) {
    console.error('Exception during therapist fetch:', error);
    return null;
  }
};

// Create a therapist team member
export const createTherapistTeamMember = async (payload: TherapistTeamMember): Promise<boolean> => {
  try {
    const token = localStorage.getItem('access_token');
    console.log('createTherapistTeamMember called, token exists:', !!token);
    if (!token) {
      console.error('No access token found');
      return false;
    }

    const safePayload: TherapistTeamMember = {
      ...payload,
      branchIds: payload.branchIds?.map(Number) ?? [],
      specializationIds: payload.specializationIds?.map(Number) ?? [],
      payment_methods: payload.payment_methods ?? [],
      faq: Array.isArray(payload.faq) ? payload.faq : [],
      availability: payload.availability ?? [],
      languagesSpoken: payload.languagesSpoken ?? [],
      permissions: payload.permissions || { admin: false },
    };

    console.log('Sending payload to API:', safePayload);

    const response = await fetch(`${API_BASE_PATH}/therapist-team`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(safePayload),
    });

    const result = await response.json();
    console.log('API response status:', response.status, 'body:', result);

    if (!response.ok || result.status === false) {
      console.error('Create failed:', result.message || 'Unknown error');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error creating therapist:', error);
    return false;
  }
};


// Update a therapist team member
export const updateTherapistTeamMember = async (
  id: string | number,
  payload: TherapistTeamMember,
): Promise<boolean> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    const safePayload: TherapistTeamMember = {
      ...payload,
      branchIds: payload.branchIds?.map(Number) ?? [],
      specializationIds: payload.specializationIds?.map(Number) ?? [],
      payment_methods: payload.payment_methods ?? [],
      faq: Array.isArray(payload.faq) ? payload.faq : [],
      availability: payload.availability ?? [],
      languagesSpoken: payload.languagesSpoken ?? [],
      permissions: payload.permissions || { admin: false },
    };
    const response = await fetch(
      `${API_BASE_PATH}/therapist-team/${encodeURIComponent(String(id))}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(safePayload),
      }
    );
    const result = await response.json();
    if (!response.ok || result.status === false) {
      console.error('Update failed:', result.message || 'Unknown error');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error updating therapist:', error);
    return false;
  }
};

// Transform form data to backend DTO
export const transformToBackendDto = (formData: TherapistTeamMember): TherapistTeamMember => ({
  firstName: formData.firstName?.trim(),
  lastName: formData.lastName?.trim(),
  full_name: formData.full_name?.trim(),
  imageUrl: formData.imageUrl?.trim(),
  contactEmail: formData.contactEmail?.trim(),
  contactPhone: formData.contactPhone?.trim(),
  aboutMe: formData.aboutMe?.trim(),
  degreesTraining: formData.degreesTraining?.trim(),
  inamiNumber: Number(formData.inamiNumber),
  payment_methods: Array.isArray(formData.payment_methods) ? formData.payment_methods : [],
  faq: Array.isArray(formData.faq) ? formData.faq : [],
  website: formData.website?.trim(),
  consultations: formData.consultations?.trim(),
  permissions: formData.permissions || { admin: false },
  role: formData.role,
  status: formData.status === 'active' ? 'active' : 'inactive',
  availability: Array.isArray(formData.availability) ? formData.availability : [],
  languagesSpoken: Array.isArray(formData.languagesSpoken) ? formData.languagesSpoken : [],
  isDelete: !!formData.isDelete,
  departmentId: Number(formData.departmentId),
  specializationIds: Array.isArray(formData.specializationIds) ? formData.specializationIds.map(Number) : [],
  branchIds: Array.isArray(formData.branchIds) ? formData.branchIds.map(Number) : [],
});

// Fetch all roles for therapist setup (unchanged)
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

// Fetch all access levels for therapist setup (unchanged)
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
