import { API_BASE_PATH } from '@/context/constants';
import { SpecializationType } from '@/types/data';

export const getSpecializations = async (
  page: number = 1,
  limit: number = 100,
  search: string = '',
): Promise<{ data: SpecializationType[]; totalCount: number }> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token found');

    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString(), search });

    const res = await fetch(`${API_BASE_PATH}/specializations?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('Failed to fetch specializations');

    const response = await res.json();
    console.log('Raw Specializations API:', response);

    const rawData = (response?.data as any[]) || [];

    // Map API fields and remove duplicates by specialization_type
    const unique: SpecializationType[] = Array.from(
      new Map(
        rawData.map((item) => [
          item.specialization_type.toLowerCase(), // dedupe key
          {
            id: item.specialization_id,
            name: item.specialization_type,
            description: item.description,
            is_active: item.is_active,
            department: item.department,
          } as SpecializationType,
        ]),
      ).values(),
    );

    console.log('Normalized Specializations:', unique);

    return { data: unique, totalCount: unique.length };
  } catch (error) {
    console.error('Error fetching specializations:', error);
    return { data: [], totalCount: 0 };
  }
};
