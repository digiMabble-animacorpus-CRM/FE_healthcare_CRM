export interface Calendar {
  id: string;
  siteId: string;
  hpId: string;
  label: string;
  color: string;
  timezone: string;
  permissions?: {
    organizationPermissions: string[];
    individualPermissions: {
      hpId: string;
      permissions: string[];
    }[];
  };
}
