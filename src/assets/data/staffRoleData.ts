import { StaffRoleType } from "@/types/data";

export const staffRoleData: StaffRoleType[] = [
  // ✅ Access Levels
  {
    _id: "al-001",
    tag: "AccessLevel",
    key: "staff",
    label: "Staff",
    description: "Basic user with limited access"
  },
  {
    _id: "al-002",
    tag: "AccessLevel",
    key: "branch-admin",
    label: "Branch Admin",
    description: "Manages staff and operations for a branch"
  },
  {
    _id: "al-003",
    tag: "AccessLevel",
    key: "super-admin",
    label: "Super Admin",
    description: "Has full access across all branches and settings",
    internal: true
  },

  // ✅ Roles
  {
    _id: "role-001",
    tag: "Role",
    key: "Doctor",
    label: "Doctor",
    description: "Handles patient care, diagnosis, and prescriptions",
    defaultPermissions: [
      "view-patients",
      "edit-patients",
      "manage-appointments",
      "prescribe-meds"
    ],
    requiresDetails: true,
    requiresAvailability: true
  },
  {
    _id: "role-002",
    tag: "Role",
    key: "Nurse",
    label: "Nurse",
    description: "Assists doctors and manages patient care",
    defaultPermissions: ["view-patients", "edit-patients"],
    requiresDetails: true,
    requiresAvailability: true
  },
  {
    _id: "role-003",
    tag: "Role",
    key: "Therapist",
    label: "Therapist",
    description: "Provides physical and mental therapy",
    defaultPermissions: ["view-patients", "edit-patients"],
    requiresDetails: true,
    requiresAvailability: true
  },
  {
    _id: "role-004",
    tag: "Role",
    key: "Receptionist",
    label: "Receptionist",
    description: "Manages appointments and front-desk operations",
    defaultPermissions: ["manage-appointments", "access-billing"]
  },
  {
    _id: "role-005",
    tag: "Role",
    key: "Pharmacist",
    label: "Pharmacist",
    description: "Manages inventory and dispenses medications",
    defaultPermissions: ["manage-inventory"],
    requiresDetails: true,
    requiresAvailability: true
  },
  {
    _id: "role-006",
    tag: "Role",
    key: "Technician",
    label: "Technician",
    description: "Handles medical equipment and diagnostics",
    defaultPermissions: ["view-patients"],
    requiresDetails: true,
    requiresAvailability: true
  },
  {
    _id: "role-007",
    tag: "Role",
    key: "SupportStaff",
    label: "Support Staff",
    description: "Supports general hospital operations",
    defaultPermissions: []
  },
  {
    _id: "role-008",
    tag: "Role",
    key: "LabTechnician",
    label: "Lab Technician",
    description: "Conducts lab tests and diagnostics",
    defaultPermissions: ["view-patients"],
    requiresDetails: true,
    requiresAvailability: true
  },
  {
    _id: "role-009",
    tag: "Role",
    key: "Assistant",
    label: "Assistant",
    description: "Assists doctors or other medical staff",
    defaultPermissions: ["view-patients"]
  },
  {
    _id: "role-010",
    tag: "Role",
    key: "Other",
    label: "Other",
    description: "Miscellaneous role not categorized",
    defaultPermissions: []
  },
  {
    _id: "role-011",
    tag: "Role",
    key: "Admin",
    label: "Administrator",
    description: "Full administrative access to the system",
    defaultPermissions: [
      "view-patients",
      "edit-patients",
      "manage-appointments",
      "prescribe-meds",
      "manage-inventory",
      "access-billing",
      "admin-access"
    ],
    internal: true
  }
];
