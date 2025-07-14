import { branches } from "@/assets/data/branchData";
import { languageData } from "@/assets/data/languageData";
import { permissionData } from "@/assets/data/permissionData";
import { staffData } from "@/assets/data/staffData";
import { staffRoleData } from "@/assets/data/staffRoleData";

import {
  StaffType,
  StaffRoleType,
  PermissionType,
  LanguageType,
  BranchType,
} from "@/types/data";

const sleep = (ms = 500) => new Promise((res) => setTimeout(res, ms));

export const getAllStaff = async (
  page: number = 1,
  limit: number = 10,
  branch?: string,
  from?: string,
  to?: string,
  search?: string
): Promise<{
  data: (StaffType & {
    role?: StaffRoleType;
    accessLevel?: StaffRoleType;
    languagesDetailed: LanguageType[];
    permissionsDetailed: (PermissionType & { enabled: boolean })[];
    branchesDetailed: BranchType[];
    selectedBranchDetailed?: BranchType | null;
  })[];
  totalCount: number;
}> => {
  await sleep(); // simulate delay

  let filteredData = staffData;

  // Branch Filter (matches any assigned branch)
  if (branch) {
    filteredData = filteredData.filter((item) =>
      item.branches.some((b) => b.id === branch)
    );
  }

  // Date Range Filter (based on updatedAt)
  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    filteredData = filteredData.filter((item) => {
      const lastUpdated =
        item.updatedBy?.[item.updatedBy.length - 1]?.updatedAt || item.createdAt;
      const updatedDate = new Date(lastUpdated);

      return (
        !isNaN(updatedDate.getTime()) &&
        updatedDate >= fromDate &&
        updatedDate <= toDate
      );
    });
  }

  // Search Filter (name, email, phoneNumber)
  if (search) {
    const lowerSearch = search.toLowerCase();
    filteredData = filteredData.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerSearch) ||
        item.email?.toLowerCase().includes(lowerSearch) ||
        item.phoneNumber.toLowerCase().includes(lowerSearch)
    );
  }

  // Pagination
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filteredData.slice(start, end);

  // Enrich each staff with detailed related data
  const enrichedData = paginatedData.map((staff: StaffType) => {
    // Find role object
    const role = staffRoleData.find(
      (r) => r._id === staff.roleId && r.tag === "Role"
    );

    // Find accessLevel object
    const accessLevel = staffRoleData.find(
      (r) => r._id === staff.accessLevelId && r.tag === "AccessLevel"
    );

    // Map languages IDs to full objects
    const languagesDetailed = (staff.languages || [])
      .map((langId) => languageData.find((l) => l._id === langId))
      .filter(Boolean) as LanguageType[];

    // Map permissions IDs to full objects plus enabled flag
    const permissionsDetailed = (staff.permissions || []).map((perm) => {
      const permDetails = permissionData.find((p) => p._id === perm._id);
      return {
        ...(permDetails || {
          _id: perm._id,
          key: "",
          label: "",
          description: "",
        }),
        enabled: perm.enabled,
      };
    });

    // Map branch IDs to full branch objects
    const branchesDetailed = (staff.branches || [])
      .map((b) => branches.find((br) => br._id === b.id))
      .filter(Boolean) as BranchType[];

    // Expand selectedBranch id to full branch object
    const selectedBranchDetailed = branches.find(
      (br) => br._id === staff.selectedBranch
    ) || null;

    return {
      ...staff,
      role,
      accessLevel,
      languagesDetailed,
      permissionsDetailed,
      branchesDetailed,
      selectedBranchDetailed,
    };
  });

  return {
    data: enrichedData,
    totalCount: filteredData.length,
  };
};


export const getStaffById = async (
  id?: string
): Promise<{ data: StaffType[] }> => {
  await sleep();

  if (!id) {
    return { data: [] };
  }

  const filtered = staffData.filter((p) => p._id === id);

  const enriched = filtered.map((staff) => {
    const role = staffRoleData.find(
      (r) => r._id === staff.roleId && r.tag === "Role"
    );

    const accessLevel = staffRoleData.find(
      (r) => r._id === staff.accessLevelId && r.tag === "AccessLevel"
    );

    const languagesDetailed = (staff.languages || [])
      .map((langId) => languageData.find((l) => l._id === langId))
      .filter(Boolean) as LanguageType[];

    const permissionsDetailed = (staff.permissions || []).map((perm) => {
      const permDetails = permissionData.find((p) => p._id === perm._id);
      return {
        ...(permDetails || { _id: perm._id, key: "", label: "", description: "" }),
        enabled: perm.enabled,
      };
    });

    const branchesDetailed = (staff.branches || [])
      .map((b) => branches.find((br) => br._id === b.id))
      .filter(Boolean) as BranchType[];

    // New: expand selectedBranch id to full branch object
    const selectedBranchDetailed = branches.find(
      (br) => br._id === staff.selectedBranch
    );

    return {
      ...staff,
      role,
      accessLevel,
      languagesDetailed,
      permissionsDetailed,
      branchesDetailed,
      selectedBranchDetailed,
    };
  });

  return { data: enriched };
};

// Optionally, get all roles and access levels for dropdowns
export const getAllRoles = (): StaffRoleType[] => {
  return staffRoleData.filter(role => role.tag === "Role");
};

export const getAllAccessLevels = (): StaffRoleType[] => {
  return staffRoleData.filter(role => role.tag === "AccessLevel");
};


export const getDefaultStaffById = async (
  id?: string
): Promise<{ data: StaffType[] }> => {
  await sleep();

  if (!id) {
    return { data: [] };
  }

  const result = staffData.filter((p) => p._id === id);

  return { data: result };
};