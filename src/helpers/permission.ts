import { permissionData } from "@/assets/data/permissionData";

import {
  PermissionType,
} from "@/types/data";

export const getAllPermissions = (): PermissionType[] => {
  return permissionData;
};