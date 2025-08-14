import { branches } from "@/assets/data/branchData";

import {
  BranchType,
} from "@/types/data";

const sleep = (ms = 500) => new Promise((res) => setTimeout(res, ms));

export const getAllBranch = (): BranchType[] => {
  return branches;
};

export const getBranches = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{
  data: BranchType[];
  totalCount: number;
}> => {
  await sleep(); // simulate delay

  let filteredData = branches;

  if (search) {
    const lowerSearch = search.toLowerCase();
    filteredData = filteredData.filter(
      (item) => item.name.toLowerCase().includes(lowerSearch)
    );
  }

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filteredData.slice(start, end);

  return {
    data: paginatedData,
    totalCount: filteredData.length,
  };
};

export const getBranchById = async (id?: string): Promise<{ data: BranchType[] }> => {
  await sleep();
  if (!id) return { data: [] };
  const result = branches.filter((p) => p._id === id);
  return { data: result };
};
