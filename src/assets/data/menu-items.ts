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
  // {
  //   key: 'caller',
  //   label: 'Caller',
  //   icon: 'ri:phone-line',
  //   url: '/caller',
  // },
  {
    key: 'tickets',
    label: 'Billets',
    icon: 'ri:ticket-2-line',
    children: [
      {
        key: 'caller',
        label: 'Ticket d’appel',
        url: '/caller',
        parentKey: 'tickets',
      },
      {
        key: 'new-request',
        label: 'Nouvelle demande de ticket',
        url: '/tickets',
        parentKey: 'tickets',
      },
      {
        key: 'appointment-management',
        label: 'Demande de rendez-vous”',
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
    key: 'therapists',
    label: 'Thérapeute',
    icon: 'ri-stethoscope-line',
    url: '/therapists/therapists-list',
  },
  {
    key: 'patients',
    label: 'Patient',
    icon: 'ri-hospital-line',
    url: '/patients/patient-list',
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
    key: 'motive',
    label: 'Motif',
    icon: 'ri-organization-chart',
    url: '/motive',
  },
  // {
  //   key: 'department',
  //   label: 'Département',
  //   icon: 'ri-organization-chart',
  //   url: '/department',
  // },
  // {
  //   key: 'specialization',
  //   label: 'Spécialisation',
  //   icon: 'ri-briefcase-4-line',
  //   url: '/specialization',
  // },
  // {
  //   key: 'languages',
  //   label: 'Langages',
  //   icon: 'ri-translate',
  //   url: '/languages',
  // },
  // {
  //   key: 'StaffRoles',
  //   label: 'Rôles du personnel',
  //   icon: 'ri-user-settings-line',
  //   url: '/staff-role',
  // },
  // {
  //   key: 'permissions',
  //   label: 'Autorisations',
  //   icon: 'ri-shield-line',
  //   url: '/permissions',
  // },
];
