import { PermissionType } from '@/types/data';

export const permissionData: PermissionType[] = [
  {
    _id: 'perm-001',
    key: 'view-patients',
    label: 'View Patients',
    description: 'Allows staff to view patient information',
    category: 'Patient',
  },
  {
    _id: 'perm-002',
    key: 'edit-patients',
    label: 'Edit Patients',
    description: 'Allows staff to edit and update patient records',
    category: 'Patient',
  },
  {
    _id: 'perm-003',
    key: 'manage-appointments',
    label: 'Manage Appointments',
    description: 'Allows staff to schedule, update, or cancel appointments',
    category: 'Scheduling',
  },
  {
    _id: 'perm-004',
    key: 'prescribe-meds',
    label: 'Prescribe Medications',
    description: 'Allows doctors to prescribe and manage medications',
    category: 'Medical',
  },
  {
    _id: 'perm-005',
    key: 'manage-inventory',
    label: 'Manage Inventory',
    description: 'Allows staff to manage medical supplies and stock levels',
    category: 'Inventory',
  },
  {
    _id: 'perm-006',
    key: 'access-billing',
    label: 'Access Billing',
    description: 'Grants access to view and manage billing and invoices',
    category: 'Finance',
  },
  {
    _id: 'perm-007',
    key: 'admin-access',
    label: 'Admin Access',
    description: 'Grants full administrative control over the system',
    category: 'System',
  },
  {
    _id: 'perm-008',
    key: 'custom',
    label: 'Custom Access',
    description: 'Special access defined manually for unique cases',
    category: 'Custom',
  },
];
