import { languageData } from '@/assets/data/languageData';
import { LanguageType } from '@/types/data';

const sleep = (ms = 500) => new Promise((res) => setTimeout(res, ms));

export const getAllLanguages = (): LanguageType[] => {
  return languageData;
};

export const getLanguages = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<{
  data: LanguageType[];
  totalCount: number;
}> => {
  await sleep(); // simulate delay

  let filteredData = languageData;

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

export const getLanguageById = async (id?: string): Promise<{ data: LanguageType[] }> => {
  await sleep();
  if (!id) return { data: [] };
  const result = languageData.filter((p) => p._id === id);
  return { data: result };
};
