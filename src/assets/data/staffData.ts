import type { StaffType } from '@/types/data';

export const staffData: StaffType[] = [
  {
    _id: 's1',
    name: 'Dr. Claire Martin',
    phoneNumber: '0471234567',
    phone_number: '0471234567',
    email: 'claire.martin@clinic.be',
    gender: 'female',
    languages: ['lang-002', 'lang-001'], // French, English

    address: {
      street: '12 Rue de la Santé',
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
    phone_number: '0466123456',
    email: 'paul.desmet@nursing.be',
    gender: 'male',
    languages: ['lang-003', 'lang-002'], // Dutch, French

    address: {
      street: '45 Avenue de Bruxelles',
      city: 'Gembloux',
      zip_code: '5030',
      country: 'Belgium',
    },
    dob: '', // Not available
    description:
      'En tant que nutrithérapeute, je vous accompagne afin de vous aider à allier le plaisir de bien manger avec la satisfaction d’améliorer votre état de santé et de contrôler votre poids. Je vous propose un accompagnement sur-mesure basé sur une approche humaine et bienveillante.',
    roleId: 'role-001', // Assumed as similar to "Doctor"
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
    phone_number: '0488123444',
    email: 'sophie.dubois@admin.be',
    gender: 'female',
    languages: ['lang-002'], // French

    address: {
      street: "88 Rue de l'Administration",
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
    phone_number: '0490111122',
    email: 'lars.verbeek@lab.be',
    gender: 'male',
    languages: ['lang-003', 'lang-001'], // Dutch, English

    address: {
      street: '5 Technologiepark',
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
    phone_number: '0455111133',
    email: 'emma.lefevre@reception.be',
    gender: 'female',
    languages: ['lang-002', 'lang-001'], // French, English

    address: {
      street: '3 Boulevard Central',
      city: 'Gembloux',
      zip_code: '5030',
      country: 'Belgium',
    },

    roleId: 'role-004', // Receptionist
    accessLevelId: 'al-001', // staff

    branches: [{ id: 'b2', isPrimary: true }],
    selectedBranch: 'b2',
    specialization: 'Nutritionniste, Naturopathe',
    experience: '', // Not specified
    education:
      "Nutrithérapie, Naturopathie, Nutrition de l'enfant, Nutrition de la femme enceinte et allaitante",
    registrationNumber: '', // Not specified
    certificationFiles: [],
    availability: [], // Would need to parse schedule text into structured days
    tags: ['nutrition', 'naturopathie'],
    status: 'active',
    permissions: [], // Not available
    loginDetails: {
      otpVerified: false,
      lastLogin: '',
      loginCount: 0,
      deviceInfo: '',
    },
    createdBy: '',
    createdAt: '',
    updatedBy: [],
  },
  {
    _id: 's26',
    name: 'Coline Bosquet',
    phoneNumber: '0477/55 63 79',
    email: 'coline.bosquet@animacorpus.be',
    gender: 'female', // Assumed
    languages: ['lang-002'], // Assuming lang-002 = French
    address: {
      line1: "15 Place de l'Orneau",
      city: 'Gembloux',
      zip_code: '5030',
      country: 'Belgium',
    },
    dob: '', // Not provided
    description:
      "Je suis diplômée en ergothérapie et passionnée par l’accompagnement des enfants et des jeunes. Forte de plusieurs années d’expérience au sein d'un centre de rééducation ambulatoire spécialisé dans l’accompagnement des enfants autistes, j'ai acquis une expertise précieuse dans la prise en charge des enfants et des jeunes.",
    roleId: 'role-003', // Custom assumed role for therapist
    accessLevelId: 'al-001', // staff
    branches: [{ id: 'b2', isPrimary: true }],
    selectedBranch: 'b2',
    specialization: 'Ergothérapeute',
    experience: '', // Not specifically defined
    education: 'Diplôme en ergothérapie', // Inferred
    registrationNumber: '65313860650', // From specializations
    certificationFiles: [],
    availability: [
      { day: 'Mardi', from: '13:00', to: '18:00' },
      { day: 'Mercredi', from: '09:00', to: '18:00' },
    ],
    tags: ['children', 'autism', 'motor-skills', 'independence'],
    status: 'active',
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: '',
      loginCount: 0,
      deviceInfo: '',
    },
    createdBy: '',
    createdAt: '',
    updatedBy: [],
  },
  {
    _id: 's20',
    name: 'Adeline Tresnie',
    phoneNumber: '0499/47.75.08',
    email: 'adeline.tresnie@animacorpus.be',
    gender: 'female', // Assumed
    languages: ['lang-002'], // Assuming lang-002 = French
    address: {
      line1: "15 Place de l'Orneau",
      city: 'Gembloux',
      zip_code: '5030',
      country: 'Belgium',
    },
    dob: '', // Not provided
    description:
      'Depuis toujours, je suis passionnée par le développement humain et la compréhension du fonctionnement cérébral. Cet intérêt m’a naturellement guidée vers des études de psychologie à l’Université de Mons [...] tout en veillant à offrir un soutien personnalisé et efficace.',
    roleId: 'role-003', // Assumed therapist role
    accessLevelId: 'al-001', // staff
    branches: [{ id: 'b2', isPrimary: true }],
    selectedBranch: 'b2',
    specialization: 'Neuropsychologue',
    experience: '', // Not specific
    education: 'Master en sciences psychologiques, à finalité spécialisée',
    registrationNumber: '', // Not clearly available
    certificationFiles: [],
    availability: [
      { day: 'Vendredi', from: '09:00', to: '18:00' },
      { day: 'Samedi', from: '09:00', to: '18:00' },
    ],
    tags: [
      'enfants',
      'adolescents',
      'adultes',
      'bilan neuropsychologique',
      'mémoire',
      'concentration',
      'méthode de travail',
      'QI',
    ],
    status: 'active',
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: '',
      loginCount: 0,
      deviceInfo: '',
    },
    createdBy: '',
    createdAt: '',
    updatedBy: [],
  },
  {
    _id: 's6',
    name: 'Super Admin Lucas Janssen',
    phoneNumber: '0479998877',
    phone_number: '0479998877',
    email: 'lucas.janssen@system.be',
    gender: 'male',
    languages: ['lang-003', 'lang-001'], // Dutch, English

    address: {
      street: '1 Rue Centrale',
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
    phone_number: '0455223344',
    email: 'elise.lambert@clinic.be',
    gender: 'female',
    languages: ['lang-002'], // French

    address: {
      street: '78 Rue Médicale',
      city: 'Namur',
      zip_code: '5000',
      country: 'Belgium',
    },

    dob: '1987-02-14',
    roleId: 'role-001', // Doctor
    accessLevelId: 'al-001', // staff

    branches: [{ id: 'b2', isPrimary: true }],
    selectedBranch: 'b2',
    specialization: 'Psychologue clinicienne',
    experience: '', // Not mentioned
    education: 'Master de psychologie clinique et psychopathologies, Université Libre de Bruxelles',
    registrationNumber: '', // Not available
    certificationFiles: [],
    availability: [
      { day: 'Lundi', from: '10:00', to: '18:00' },
      { day: 'Mardi', from: '10:00', to: '17:30' },
    ],
    tags: [
      'enfants',
      'adolescents',
      'psychothérapie',
      'EMDR',
      'douleurs chroniques',
      'cognitivo-comportementale',
    ],
    status: 'active',
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: '',
      loginCount: 0,
      deviceInfo: '',
    },
    createdBy: '',
    createdAt: '',
    updatedBy: [],
  },
  {
    _id: 's8',
    name: 'Assistant Noor Vermeulen',
    phoneNumber: '0466557788',
    phone_number: '0466557788',
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
    phone_number: '0488553322',
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
    phone_number: '0455992244',
    email: 'lien.janssens@reception.be',
    gender: 'female',
    languages: ['lang-002', 'lang-001'], // French, English

    roleId: 'role-004', // Receptionist
    accessLevelId: 'al-001', // staff

    branches: [{ id: 'b2', isPrimary: true }],
    selectedBranch: 'b2',
    specialization: 'Hypnothérapeute',
    experience: '', // Not specified
    education: 'Diplôme en kinésithérapie, UCLouvain; Certificat en hypnose médicale, ULB',
    registrationNumber: '', // Not available
    certificationFiles: [],
    availability: [], // No structured hours provided
    tags: [
      'hypnothérapie',
      'douleurs chroniques',
      'anxiété',
      'burn-out',
      'sommeil',
      'addictions',
      'TDAH',
      'enfants',
      'adultes',
    ],
    status: 'active',
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: '',
      loginCount: 0,
      deviceInfo: '',
    },
    createdBy: '',
    createdAt: '',
    updatedBy: [],
  },
  {
    _id: 's13',
    name: 'Lise Langlois',
    phoneNumber: '33646/33.04.07',
    email: 'lise.langlois@animacorpus.be',
    gender: 'female', // Assumed
    languages: ['lang-002'], // Français
    address: {
      line1: "15 Place de l'Orneau",
      city: 'Gembloux',
      zip_code: '5030',
      country: 'Belgium',
    },
    dob: '', // Not provided
    description:
      "Master en logopédie à l'UCL, spécialisée en aphasie et troubles neuro-développementaux. Passionnée par l'accompagnement des personnes en difficulté de langage et de communication.",
    roleId: 'role-003', // Assuming therapist or speech therapist (logopède)
    accessLevelId: 'al-001',
    branches: [{ id: 'b2', isPrimary: true }], // Gembloux
    selectedBranch: 'b2',
    specialization: 'Logopède',
    experience: '', // Not specified
    education:
      'Master en logopédie, UCL, spécialisation aphasie et troubles neuro-développementaux',
    registrationNumber: '', // Not provided
    certificationFiles: [],
    availability: [], // No structured hours provided
    tags: [
      'logopédie',
      'aphasie',
      'dyslexie',
      'dyscalculie',
      'dysorthographie',
      'dysphasie',
      'troubles neuro-développementaux',
      'maladies neuro-dégénératives',
    ],
    status: 'active',
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: '',
      loginCount: 0,
      deviceInfo: '',
    },
    createdBy: '',
    createdAt: '',
    updatedBy: [],
  },
  {
    _id: 's19',
    name: 'Dinahlee Moreau',
    phoneNumber: '0466/42.88.66',
    email: 'dinahlee.moreau@animacorpus.be',
    gender: 'female', // Assumed
    languages: ['lang-002'], // Français
    address: {
      line1: "15 Place de l'Orneau",
      city: 'Gembloux',
      zip_code: '5030',
      country: 'Belgium',
    },
    dob: '', // Not provided
    description:
      'Neuropsychologue spécialisée dans les troubles neurodéveloppementaux et neurodégénératifs. Réalise des bilans cognitifs complets (QI, attention, mémoire, fonctions exécutives) et accompagne enfants, adultes et personnes âgées.',
    roleId: 'role-003', // Assuming therapist/neuropsychologist
    accessLevelId: 'al-001',
    branches: [
      { id: 'b2', isPrimary: true }, // Anima Corpus Gembloux
      { id: 'b3', isPrimary: false }, // CNR 542 Montigny-le-Tilleul — optionally define this as a separate branch
    ],
    selectedBranch: 'b2',
    specialization: 'Neuropsychologue',
    experience: '', // Not specified directly
    education:
      'Master en Psychologie clinique spécialisée en Neuropsychologie, Université Catholique de Louvain',
    registrationNumber: '', // Not provided
    certificationFiles: [],
    availability: [
      {
        day: 'Mardi',
        from: '08:00',
        to: '14:00',
      },
      {
        day: 'Vendredi',
        from: '08:00',
        to: '20:30',
      },
      {
        day: 'Mercredi',
        from: '08:00',
        to: '18:00',
      },
      {
        day: 'Jeudi',
        from: '08:00',
        to: '18:00',
      },
    ],
    tags: [
      'neuropsychologie',
      'bilans cognitifs',
      'troubles neurodéveloppementaux',
      'troubles neurodégénératifs',
      'QI',
      'TDAH',
      'HPI',
      'Alzheimer',
      'Parkinson',
      'guidance parentale',
      'accompagnement scolaire',
    ],
    status: 'active',
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: '',
      loginCount: 0,
      deviceInfo: '',
    },
    createdBy: '',
    createdAt: '',
    updatedBy: [],
  },
  {
    _id: 's11',
    name: 'Alice Lechanteur',
    phoneNumber: '0493/42.61.16',
    email: 'alice.lechanteur@animacorpus.be',
    gender: 'female',
    languages: ['lang-002'], // Français
    address: {
      line1: "Place de l'Orneau 15",
      city: 'Gembloux',
      zip_code: '5030',
      country: 'Belgium',
    },
    dob: '',
    description:
      'Logopède prenant en charge les enfants dès 3 ans, les adultes et les personnes âgées. Elle propose bilans langagiers, vocaux, et séances de rééducation. Guidance parentale et aménagements personnalisés possibles.',
    roleId: 'role-006', // Logopède
    accessLevelId: 'al-001',
    branches: [{ id: 'b2', isPrimary: true }], // Anima Corpus Gembloux
    selectedBranch: 'b2',
    specialization: 'Logopède',
    experience: '',
    education: 'Numéro INAMI: 60896501802',
    registrationNumber: '60896501802',
    certificationFiles: [],
    availability: [], // No detailed schedule provided
    tags: [
      'logopède',
      'langage oral',
      'langage écrit',
      'dyslexie',
      'troubles oro-pédiatriques',
      'difficultés vocales',
      'pathologies neurodégénératives',
      'guidance parentale',
    ],
    status: 'active',
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: '',
      loginCount: 0,
      deviceInfo: '',
    },
    createdBy: '',
    createdAt: '',
    updatedBy: [],
  },
  {
    _id: 's3',
    name: 'Constance Darcheville',
    phoneNumber: '0498/66.93.18',
    email: 'constance.darcheville@animacorpus.be',
    gender: 'female',
    languages: ['lang-002'], // Français
    address: {
      line1: "Place de l'Orneau 15",
      city: 'Gembloux',
      zip_code: '5030',
      country: 'Belgium',
    },
    dob: '',
    description:
      'Psychologue clinicienne spécialisée dans les soins palliatifs, le post-partum et la pleine conscience. Elle accompagne les adultes dans leurs difficultés personnelles, stress, deuils ou burn-out. Consultations disponibles également à Haumea (Gembloux).',
    roleId: 'role-004', // Psychologue clinicienne
    accessLevelId: 'al-001',
    branches: [
      { id: 'b2', isPrimary: true }, // Anima Corpus Gembloux
      { id: 'b4', isPrimary: false }, // Haumea - Chaussée de Charleroi 79
    ],
    selectedBranch: 'b2',
    specialization: 'Psychologue clinicienne',
    experience: '',
    education:
      'Master en Psychologie - UCL\nCertificat en soins palliatifs - UCL\nCertificat en Interventions psychologiques basée sur la Pleine Conscience - UCL\nFormations diverses (burn-out parental, post-partum, etc.)',
    registrationNumber: '70101702000',
    certificationFiles: [],
    availability: [
      {
        day: 'Mardi',
        from: '09:00',
        to: '18:30',
      },
      {
        day: 'Jeudi',
        from: '09:00',
        to: '16:00',
      },
      {
        day: 'Vendredi',
        from: '09:00',
        to: '16:00',
      },
      {
        day: 'Lundi',
        from: '09:00',
        to: '13:00',
      },
    ],
    tags: [
      'psychologue',
      'pleine conscience',
      'post-partum',
      'burn-out parental',
      'soins palliatifs',
      'adultes',
      'stress',
      'accompagnement émotionnel',
    ],
    status: 'active',
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: '',
      loginCount: 0,
      deviceInfo: '',
    },
    createdBy: '',
    createdAt: '',
    updatedBy: [],
  },
  {
    _id: 's27',
    name: 'Emeline Gillmann',
    phoneNumber: '0456 89 04 99',
    email: 'emeline.gillmann@animacorpus.be',
    gender: 'female',
    languages: ['lang-001', 'lang-002'], // Néerlandais, Français
    address: {
      line1: "Place de l'Orneau 15",
      city: 'Gembloux',
      zip_code: '5030',
      country: 'Belgium',
    },
    dob: '',
    description:
      'Kinésiologue pour toute la famille (bébés, enfants, ados, adultes, seniors). Approche psycho-corporelle douce pour libérer les stress et retrouver un équilibre intérieur durable.',
    roleId: 'role-009', // Kinésiologue
    accessLevelId: 'al-001',
    branches: [{ id: 'b2', isPrimary: true }], // Anima Corpus Gembloux
    selectedBranch: 'b2',
    specialization: 'Kinésiologie',
    experience: '',
    education:
      'Kinésiologue Certifiée FBK (1000+ heures): Touch for Health, Stress Release, SIPS, Brain Gym, Three in One Concepts, Core Kinesiology, Reiki (3e), Wellness Coach, Pleine Conscience, Master en Sciences du Travail',
    registrationNumber: '',
    certificationFiles: [],
    availability: [
      {
        day: 'Lundi',
        from: '14:30',
        to: '20:30',
      },
      {
        day: 'Jeudi',
        from: '09:00',
        to: '14:00',
      },
      {
        day: 'Vendredi',
        from: '09:00',
        to: '14:00',
      },
    ],
    tags: [
      'kinésiologie',
      'gestion du stress',
      'troubles du sommeil',
      'difficultés relationnelles',
      'troubles de l’apprentissage',
      'préparation examens',
      'douleurs chroniques',
      'équilibre émotionnel',
      'confiance en soi',
      'bien-être global',
    ],
    status: 'active',
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: '',
      loginCount: 0,
      deviceInfo: '',
    },
    createdBy: '',
    createdAt: '',
    updatedBy: [],
  },
  {
    _id: 's12',
    name: 'Pauline Roberfroid',
    phoneNumber: '0493/29.15.15',
    email: 'pauline.roberfroid@animacorpus.be',
    gender: 'female',
    languages: ['lang-002'], // Français
    address: {
      line1: "Place de l'Orneau 15",
      city: 'Gembloux',
      zip_code: '5030',
      country: 'Belgium',
    },
    dob: '',
    description:
      "Logopède spécialisée en troubles du langage d’origine neurologique et en revalidation pour enfants et adultes. Bienveillante et investie dans l'accompagnement thérapeutique personnalisé.",
    roleId: 'role-006', // Logopède
    accessLevelId: 'al-001',
    branches: [{ id: 'b2', isPrimary: true }], // Anima Corpus Gembloux
    selectedBranch: 'b2',
    specialization: 'Logopédie neurologique',
    experience: '',
    education:
      'Diplôme en logopédie - Haute École Léonard de Vinci & UCLouvain\nMaster de spécialisation en troubles du langage neurologique\nNuméro INAMI: 60785544802',
    registrationNumber: '60785544802',
    certificationFiles: [],
    availability: [
      {
        day: 'Mardi',
        from: '14:30',
        to: '18:00',
      },
      {
        day: 'Mercredi',
        from: '09:00',
        to: '18:00',
      },
    ],
    tags: [
      'logopède',
      'aphasie',
      'dysarthrie',
      'dysphagie',
      'troubles neurodégénératifs',
      'dyslexie',
      'dyscalculie',
      'troubles du langage oral',
      'troubles articulatoires',
      'enfants',
      'adultes',
    ],
    status: 'active',
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: '',
      loginCount: 0,
      deviceInfo: '',
    },
    createdBy: '',
    createdAt: '',
    updatedBy: [],
  },
];
