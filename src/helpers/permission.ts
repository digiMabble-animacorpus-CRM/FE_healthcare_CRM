import { permissionData } from '@/assets/data/permissionData';

import { PermissionType } from '@/types/data';
const sleep = (ms = 500) => new Promise((res) => setTimeout(res, ms));

export const getAllPermissions = (): PermissionType[] => {
  return permissionData;
};

export const getPermissions = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<{
  data: PermissionType[];
  totalCount: number;
}> => {
  await sleep(); // simulate delay

  let filteredData = permissionData;

  if (search) {
    const lowerSearch = search.toLowerCase();
    filteredData = filteredData.filter((item) => item.label.toLowerCase().includes(lowerSearch));
  }

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filteredData.slice(start, end);

  return {
    data: paginatedData,
    totalCount: filteredData.length,
  };
};

export const getPermissionById = async (id?: string): Promise<{ data: PermissionType[] }> => {
  await sleep();
  if (!id) return { data: [] };
  const result = permissionData.filter((p) => p._id === id);
  return { data: result };
};
