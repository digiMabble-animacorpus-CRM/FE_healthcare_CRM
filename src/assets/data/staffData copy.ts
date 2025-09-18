import type { StaffType } from '@/types/data';

export const staffData: StaffType[] = [
  {
    _id: 's1',
    name: 'Dr. Claire Martin',
    phoneNumber: '0471234567',
    email: 'claire.martin@clinic.be',
    gender: 'female',
    languages: ['lang-002', 'lang-001'], // French, English

    address: {
      line1: '12 Rue de la Santé',
      city: 'Namur',
      zip_code: '5000',
      country: 'France',
    },
    dob: '1982-05-17',
    description: 'General practitioner with 15 years of experience.',
    roleId: 'role-001', // Doctor
    accessLevelId: 'al-002', // branch-admin

    branches: [{ id: 'b3', isPrimary: true }],
    selectedBranch: 'b3',
    specialization: 'Family Medicine',
    experience: '15 years',
    education: 'Université catholique de Louvain',
    registrationNumber: 'MD-BE-2025-0001',

    certificationFiles: [],

    availability: [
      { day: 'Lundi', from: '09:00', to: '13:00' },
      { day: 'Mercredi', from: '10:00', to: '14:00' },
    ],

    tags: ['general', 'pediatrics'],

    status: 'active',

    permissions: [
      { _id: 'perm-001', enabled: true }, // view-patients
      { _id: 'perm-002', enabled: true }, // edit-patients
      { _id: 'perm-004', enabled: true }, // prescribe-meds
      { _id: 'perm-007', enabled: true }, // admin-access
    ],

    loginDetails: {
      otpVerified: true,
      lastLogin: '2025-07-08T09:00:00.000Z',
      loginCount: 42,
      deviceInfo: 'Chrome - Windows 11',
    },

    createdBy: 's6',
    createdAt: '2025-06-01T10:30:00.000Z',
    updatedBy: [{ staffId: 's6', updatedAt: '2025-07-07T12:00:00.000Z' }],
  },

  {
    _id: 's2',
    name: 'Nurse Paul De Smet',
    phoneNumber: '0466123456',
    email: 'paul.desmet@nursing.be',
    gender: 'male',
    languages: ['lang-003', 'lang-002'], // Dutch, French

    address: {
      line1: '45 Avenue de Bruxelles',
      city: 'Gembloux',
      zip_code: '5030',
      country: 'Belgium',
    },

    dob: '1990-10-23',
    roleId: 'role-002', // Nurse
    accessLevelId: 'al-001', // staff

    branches: [{ id: 'b1', isPrimary: true }],
    selectedBranch: 'b1',

    experience: '8 years',
    education: 'Haute École Vinci',

    certificationFiles: [],

    availability: [
      { day: 'Mardi', from: '08:00', to: '12:00' },
      { day: 'Vendredi', from: '14:00', to: '18:00' },
    ],

    tags: ['injection', 'pediatrics'],

    status: 'active',

    permissions: [
      { _id: 'perm-001', enabled: true }, // view-patients
      { _id: 'perm-003', enabled: true }, // manage-appointments
    ],

    loginDetails: {
      otpVerified: true,
      lastLogin: '2025-07-06T17:00:00.000Z',
      loginCount: 30,
      deviceInfo: 'Firefox - MacOS',
    },

    createdBy: 's3',
    createdAt: '2025-04-15T14:22:00.000Z',
    updatedBy: [],
  },

  {
    _id: 's3',
    name: 'Admin Sophie Dubois',
    phoneNumber: '0488123444',
    email: 'sophie.dubois@admin.be',
    gender: 'female',
    languages: ['lang-002'], // French

    address: {
      line1: "88 Rue de l'Administration",
      city: 'Gembloux',
      zip_code: '5030',
      country: 'Belgium',
    },

    roleId: 'role-011', // Admin
    accessLevelId: 'al-003', // super-admin

    branches: [{ id: 'b1' }, { id: 'b2' }, { id: 'b3' }],
    selectedBranch: 'b2',

    status: 'active',

    permissions: [
      { _id: 'perm-007', enabled: true }, // admin-access
      { _id: 'perm-005', enabled: true }, // manage-inventory
      { _id: 'perm-006', enabled: true }, // access-billing
    ],

    loginDetails: {
      otpVerified: true,
      lastLogin: '2025-07-07T08:00:00.000Z',
      loginCount: 65,
      deviceInfo: 'Edge - Windows 10',
    },

    createdBy: 's6',
    createdAt: '2025-03-20T11:45:00.000Z',
    updatedBy: [{ staffId: 's6', updatedAt: '2025-06-15T10:10:00.000Z' }],
  },

  {
    _id: 's4',
    name: 'Technician Lars Verbeek',
    phoneNumber: '0490111122',
    email: 'lars.verbeek@lab.be',
    gender: 'male',
    languages: ['lang-003', 'lang-001'], // Dutch, English

    address: {
      line1: '5 Technologiepark',
      city: 'Namur',
      zip_code: '5000',
      country: 'Belgium',
    },

    roleId: 'role-006', // Technician
    accessLevelId: 'al-001', // staff

    branches: [{ id: 'b3', isPrimary: true }],
    selectedBranch: 'b3',

    education: 'Technische Hogeschool Antwerpen',
    experience: '6 years',

    certificationFiles: [],

    tags: ['blood test', 'equipment'],

    status: 'active',

    permissions: [
      { _id: 'perm-005', enabled: true }, // manage-inventory
    ],

    loginDetails: {
      otpVerified: true,
      lastLogin: '2025-07-05T15:00:00.000Z',
      loginCount: 14,
      deviceInfo: 'Safari - iOS',
    },

    createdBy: 's3',
    createdAt: '2025-05-05T09:00:00.000Z',
    updatedBy: [],
  },

  {
    _id: 's5',
    name: 'Receptionist Emma Lefevre',
    phoneNumber: '0455111133',
    email: 'emma.lefevre@reception.be',
    gender: 'female',
    languages: ['lang-002', 'lang-001'], // French, English

    address: {
      line1: '3 Boulevard Central',
      city: 'Gembloux',
      zip_code: '5030',
      country: 'Belgium',
    },

    roleId: 'role-004', // Receptionist
    accessLevelId: 'al-001', // staff

    branches: [{ id: 'b2', isPrimary: true }],
    selectedBranch: 'b2',

    experience: '3 years',

    certificationFiles: [],

    tags: [],

    status: 'active',

    permissions: [
      { _id: 'perm-003', enabled: true }, // manage-appointments
    ],

    loginDetails: {
      otpVerified: true,
      lastLogin: '2025-07-08T08:30:00.000Z',
      loginCount: 18,
      deviceInfo: 'Chrome - Android',
    },

    createdBy: 's3',
    createdAt: '2025-06-10T12:00:00.000Z',
    updatedBy: [],
  },

  {
    _id: 's6',
    name: 'Super Admin Lucas Janssen',
    phoneNumber: '0479998877',
    email: 'lucas.janssen@system.be',
    gender: 'male',
    languages: ['lang-003', 'lang-001'], // Dutch, English

    address: {
      line1: '1 Rue Centrale',
      city: 'Namur',
      zip_code: '5000',
      country: 'Belgium',
    },

    roleId: 'role-011', // Admin
    accessLevelId: 'al-003', // super-admin

    branches: [{ id: 'b1' }, { id: 'b2' }, { id: 'b3' }],
    selectedBranch: 'b3',

    status: 'active',

    permissions: [
      { _id: 'perm-007', enabled: true }, // admin-access
      { _id: 'perm-003', enabled: true }, // manage-appointments
      { _id: 'perm-005', enabled: true }, // manage-inventory
      { _id: 'perm-006', enabled: true }, // access-billing
      { _id: 'perm-001', enabled: true }, // view-patients
    ],

    loginDetails: {
      otpVerified: true,
      loginCount: 75,
      lastLogin: '2025-07-09T09:00:00.000Z',
      deviceInfo: 'Chrome - Windows 11',
    },

    createdBy: 's1',
    createdAt: '2025-01-01T09:00:00.000Z',
    updatedBy: [],
  },

  {
    _id: 's7',
    name: 'Dr. Elise Lambert',
    phoneNumber: '0455223344',
    email: 'elise.lambert@clinic.be',
    gender: 'female',
    languages: ['lang-002'], // French

    address: {
      line1: '78 Rue Médicale',
      city: 'Namur',
      zip_code: '5000',
      country: 'Belgium',
    },

    dob: '1987-02-14',
    roleId: 'role-001', // Doctor
    accessLevelId: 'al-001', // staff

    branches: [{ id: 'b2', isPrimary: true }],
    selectedBranch: 'b2',

    specialization: 'Dermatology',
    experience: '10 years',
    education: 'Université de Liège',
    registrationNumber: 'MD-BE-2025-0012',

    certificationFiles: [],

    availability: [
      { day: 'Mardi', from: '09:00', to: '13:00' },
      { day: 'Jeudi', from: '14:00', to: '18:00' },
    ],

    tags: ['skin', 'allergies'],

    status: 'active',

    permissions: [
      { _id: 'perm-001', enabled: true }, // view-patients
      { _id: 'perm-002', enabled: true }, // edit-patients
    ],

    loginDetails: {
      otpVerified: true,
      lastLogin: '2025-07-08T11:00:00.000Z',
      loginCount: 34,
      deviceInfo: 'Firefox - Ubuntu',
    },

    createdBy: 's3',
    createdAt: '2025-03-18T10:00:00.000Z',
    updatedBy: [],
  },

  {
    _id: 's8',
    name: 'Assistant Noor Vermeulen',
    phoneNumber: '0466557788',
    email: 'noor.vermeulen@support.be',
    gender: 'female',
    languages: ['lang-003', 'lang-002'], // Dutch, French

    roleId: 'role-009', // Assistant
    accessLevelId: 'al-001', // staff

    branches: [{ id: 'b1', isPrimary: true }],
    selectedBranch: 'b1',

    experience: '4 years',
    education: 'IFAPME Namur',

    certificationFiles: [],

    status: 'active',

    permissions: [
      { _id: 'perm-003', enabled: true }, // manage-appointments
      { _id: 'perm-001', enabled: true }, // view-patients
    ],

    loginDetails: {
      otpVerified: true,
      lastLogin: '2025-07-09T10:30:00.000Z',
      loginCount: 22,
      deviceInfo: 'Safari - macOS',
    },

    createdBy: 's2',
    createdAt: '2025-05-10T11:00:00.000Z',
    updatedBy: [],
  },

  {
    _id: 's9',
    name: 'Lab Assistant Hugo De Wilde',
    phoneNumber: '0488553322',
    email: 'hugo.dewilde@lab.be',
    gender: 'male',
    languages: ['lang-003'], // Dutch

    roleId: 'role-008', // Lab Technician
    accessLevelId: 'al-001', // staff

    branches: [{ id: 'b3', isPrimary: true }],
    selectedBranch: 'b3',

    experience: '2 years',
    education: 'Technobel',

    certificationFiles: [],

    tags: ['equipment'],

    status: 'active',

    permissions: [
      { _id: 'perm-005', enabled: true }, // manage-inventory
    ],

    loginDetails: {
      otpVerified: true,
      lastLogin: '2025-07-09T07:30:00.000Z',
      loginCount: 12,
      deviceInfo: 'Chrome - Linux',
    },

    createdBy: 's4',
    createdAt: '2025-06-01T14:00:00.000Z',
    updatedBy: [],
  },

  {
    _id: 's10',
    name: 'Receptionist Lien Janssens',
    phoneNumber: '0455992244',
    email: 'lien.janssens@reception.be',
    gender: 'female',
    languages: ['lang-002', 'lang-001'], // French, English

    roleId: 'role-004', // Receptionist
    accessLevelId: 'al-001', // staff

    branches: [{ id: 'b2', isPrimary: true }],
    selectedBranch: 'b2',

    experience: '2 years',

    certificationFiles: [],

    tags: [],

    status: 'active',

    permissions: [
      { _id: 'perm-003', enabled: true }, // manage-appointments
    ],

    loginDetails: {
      otpVerified: true,
      lastLogin: '2025-07-06T08:00:00.000Z',
      loginCount: 16,
      deviceInfo: 'Firefox - Windows 10',
    },

    createdBy: 's5',
    createdAt: '2025-06-20T10:30:00.000Z',
    updatedBy: [],
  },
];
