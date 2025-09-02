import { API_BASE_PATH } from '@/context/constants';
import { DepartmentType } from '@/types/data';

export const getDepartments = async (
  page: number,
  limit: number,
  search: string
): Promise<{ data: DepartmentType[]; totalCount: number }> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token found');

    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search,
    });

    const res = await fetch(`${API_BASE_PATH}/departments?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error('Failed to fetch departments');

    const response = await res.json();

    return {
      data: response?.data || [],
      totalCount: response?.totalCount || 0,
    };
  } catch (error) {
    console.error('Error fetching departments:', error);
    return { data: [], totalCount: 0 };
  }
};
