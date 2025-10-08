import { API_BASE_PATH } from '@/context/constants';
import { LanguageType } from '@/types/data';

export const getAllLanguages = async (): Promise<LanguageType[]> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token found');

    const res = await fetch(`${API_BASE_PATH}/languages`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch all languages. Status: ${res.status}`);
    }

    const response = await res.json();

    return Array.isArray(response) ? response : response?.data || [];
  } catch (error) {
    console.error(' Error fetching all languages:', error);
    return [];
  }
};

export const getLanguages = async (
  page: number = 1,
  limit: number = 10,
  search: string = '',
): Promise<{
  data: LanguageType[];
  totalCount: number;
}> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token found');

    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search,
    });

    const res = await fetch(`${API_BASE_PATH}/languages?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch paginated languages. Status: ${res.status}`);
    }

    const response = await res.json();
    return {
      data: response?.data || [],
      totalCount: response?.totalCount || 0,
    };
  } catch (error) {
    console.error(' Error fetching paginated languages:', error);
    return { data: [], totalCount: 0 };
  }
};

export const getLanguageById = async (id?: string): Promise<{ data: LanguageType[] }> => {
  try {
    if (!id) return { data: [] };

    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token found');

    const res = await fetch(`${API_BASE_PATH}/languages/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch language by ID. Status: ${res.status}`);
    }

    const response = await res.json();

    return { data: response?.data ? [response.data] : [] };
  } catch (error) {
    console.error(' Error fetching language by ID:', error);
    return { data: [] };
  }
};
