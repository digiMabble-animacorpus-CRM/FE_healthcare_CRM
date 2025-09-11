import { MenuItemType } from '@/types/menu';

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'menu',
    label: 'MENU',
    isTitle: true,
  },
  {
    key: 'dashboards',
    label: 'Dashboards',
    icon: 'ri:dashboard-2-line',
    url: '/dashboards/agent',
  },

  {
    key: 'appointments',
    label: 'Appointments',
    icon: 'ri-calendar-line',
    url: '/appointments/appointment-list',
  },

  {
    key: 'therapists',
    label: 'Therapist',
    icon: 'ri-stethoscope-line',
    children: [
      {
        key: 'therapists-list',
        label: 'Therapists List',
        url: '/therapists/therapists-list',
        parentKey: 'therapists',
      },
      {
        key: 'add-therapist',
        label: 'Add Therapist',
        url: '/therapists/add-therapist',
        parentKey: 'therapists',
      },
    ],
  },
  {
    key: 'patients',
    label: 'Patient',
    icon: 'ri-hospital-line',
    children: [
      {
        key: 'patient-list',
        label: 'Patient List',
        url: '/patients/patient-list',
        parentKey: 'patients',
      },
      {
        key: 'add-patient',
        label: 'Add Patient',
        url: '/patients/add-patient',
        parentKey: 'patients',
      },
    ],
  },
  {
    key: 'teams',
    label: 'Teams',
    icon: 'ri-team-line',
    children: [
      {
        key: 'teams-list',
        label: 'Teams List',
        url: '/teams/teams-list',
        parentKey: 'teams',
      },
      {
        key: 'add-teams',
        label: 'Add Teams',
        url: '/teams/add-team/',
        parentKey: 'teams',
      },
    ],
  },

  {
    key: 'settings',
    label: 'Settings',
    isTitle: true,
  },
  {
    key: 'languages',
    label: 'Languages',
    icon: 'ri-translate',
    url: '/languages',
  },
  {
    key: 'StaffRoles',
    label: 'Staff Roles',
    icon: 'ri-user-settings-line',
    url: '/staff-role',
  },
  {
    key: 'permissions',
    label: 'Permissions',
    icon: 'ri-shield-line',
    url: '/permissions',
  },
  {
    key: 'branchs',
    label: 'Branches',
    icon: 'ri-building-2-line',
    url: '/branches',
  },
  {
    key: 'department',
    label: 'Department',
    icon: 'ri-organization-chart',
    url: '/department',
  },
];
