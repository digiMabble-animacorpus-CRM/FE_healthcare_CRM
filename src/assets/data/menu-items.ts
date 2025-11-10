import { MenuItemType } from '@/types/menu';

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'menu',
    label: 'MENU',
    isTitle: true,
  },
  {
    key: 'dashboards',
    label: 'Tableau de bord',
    icon: 'ri:dashboard-2-line',
    url: '/dashboards/agent',
  },

  {
    key: 'appointments',
    label: 'Rendez-vous',
    icon: 'ri-calendar-line',
    url: '/appointment-calender',
  },

  {
    key: 'chat',
    label: 'Historique des discussions',
    icon: 'ri:message-2-line',
    url: '/chat',
  },
  {
    key: 'tickets',
    label: 'Billets',
    icon: 'ri:ticket-2-line',
    children: [
      {
        key: 'new-request',
        label: 'Nouvelle demande',
        url: '/tickets',
        parentKey: 'tickets',
      },
      {
        key: 'appointment-management',
        label: 'Gestion des rendez-vous',
        url: '/appointment-management',
        parentKey: 'tickets',
      },
    ],
  },
  // {
  //   key: 'therapists',
  //   label: 'Thérapeute old',
  //   icon: 'ri-stethoscope-line',
  //   children: [
  //     {
  //       key: 'therapists-list',
  //       label: 'Liste des thérapeutes',
  //       url: '/therapists/therapists-list',
  //       parentKey: 'therapists',
  //     },
  //     {
  //       key: 'add-therapist',
  //       label: 'Ajouter un thérapeute',
  //       url: '/therapists/add-therapist',
  //       parentKey: 'therapists',
  //     },
  //   ],
  // },
  {
    key: 'therapistsTeam',
    label: 'Thérapeute',
    icon: 'ri-stethoscope-line',
    children: [
      {
        key: 'TherapistTeam-list',
        label: 'Liste des thérapeutes',
        url: '/therapists/therapists-list',
        parentKey: 'therapistsTeam',
      },
      {
        key: 'add-TherapistTeam',
        label: 'Ajouter un thérapeute',
        url: '/therapist-team/add-TherapistTeam',
        parentKey: 'therapistsTeam',
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
        label: 'Liste des patients',
        url: '/patients/patient-list',
        parentKey: 'patients',
      },
      {
        key: 'add-patient',
        label: 'Ajouter un patient',
        url: '/patients/add-patient',
        parentKey: 'patients',
      },
    ],
  },
  // {
  //   key: 'teams',
  //   label: 'Équipes',
  //   icon: 'ri-team-line',
  //   children: [
  //     {
  //       key: 'teams-list',
  //       label: 'Liste des équipes',
  //       url: '/teams/teams-list',
  //       parentKey: 'teams',
  //     },
  //     {
  //       key: 'add-teams',
  //       label: 'Ajouter des équipes',
  //       url: '/teams/add-team/',
  //       parentKey: 'teams',
  //     },
  //   ],
  // },
  {
    key: 'settings',
    label: 'Paramètres',
    isTitle: true,
  },
  {
    key: 'branchs',
    label: 'succursales',
    icon: 'ri-building-2-line',
    url: '/branches',
  },
  {
    key: 'department',
    label: 'Département',
    icon: 'ri-organization-chart',
    url: '/department',
  },
  {
    key: 'specialization',
    label: 'Spécialisation',
    icon: 'ri-briefcase-4-line',
    url: '/specialization',
  },
  {
    key: 'languages',
    label: 'Langages',
    icon: 'ri-translate',
    url: '/languages',
  },
  {
    key: 'StaffRoles',
    label: 'Rôles du personnel',
    icon: 'ri-user-settings-line',
    url: '/staff-role',
  },
  {
    key: 'permissions',
    label: 'Autorisations',
    icon: 'ri-shield-line',
    url: '/permissions',
  },
];
