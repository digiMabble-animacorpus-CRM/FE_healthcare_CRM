import { getSignal } from '@/lib/apiAbort';
import { HealthProfessional } from './types';
import { ROSA_BASE_API_PATH } from '@/context/constants';

export const getAllHps = async (
  page: number = 1,
  limit: number = 10,
  sortField: string = 'startAt',
  sortDirection: number = 1,
): Promise<{ data: HealthProfessional[]; totalCount: number; totalPage: number; page: number }> => {
  try {
    const token = localStorage.getItem('rosa_token');
    if (!token) {
      console.warn('No access token found.');
      return { data: [], totalCount: 0, totalPage: 0, page: 0 };
    }

    const filters: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      sortField,
      sortDirection: sortDirection.toString(),
    };

    const queryParams = new URLSearchParams(filters).toString();

    const response = await fetch(`${ROSA_BASE_API_PATH}/hps?${queryParams}`, {
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
    return {
      data: jsonData?.elements || [],
      totalCount: jsonData?.totalCount || 0,
      totalPage: jsonData?.totalPages || 0,
      page: jsonData?.page || 1,
    };
  } catch (error) {
    console.error('Error fetching health professionals:', error);
    return { data: [], totalCount: 0, totalPage: 0, page: 0 };
  }
};
