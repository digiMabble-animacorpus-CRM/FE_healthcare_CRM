import { branches } from "@/assets/data/branchData";

import {
  BranchType,
} from "@/types/data";

export const getAllBranch = (): BranchType[] => {
  return branches;
};