import type { StaffType } from "@/types/data";

export const staffData: StaffType[] = [
  {
    _id: "s24",
    name: "Camille Hoper",
    phoneNumber: "0492/36.54.50",
    email: "camille.hoper@animacorpus.be",
    gender: "female", // Assumed from name
    languages: ["lang-002"], // Assuming 'lang-002' = French
    address: {
      line1: "15 Place de l'Orneau",
      city: "Gembloux",
      zipCode: "5030",
      country: "Belgium",
    },
    dob: "", // Not available
    description:
      "En tant que nutrithérapeute, je vous accompagne afin de vous aider à allier le plaisir de bien manger avec la satisfaction d’améliorer votre état de santé et de contrôler votre poids. Je vous propose un accompagnement sur-mesure basé sur une approche humaine et bienveillante.",
    roleId: "Doctor", // Assumed as similar to "Doctor"
    accessLevelId: "staff", // staff
    branches: [{ id: "b2", isPrimary: true }],
    selectedBranch: "b2",
    specialization: "Nutritionniste, Naturopathe",
    experience: "", // Not specified
    education:
      "Nutrithérapie, Naturopathie, Nutrition de l'enfant, Nutrition de la femme enceinte et allaitante",
    registrationNumber: "RA20110080020031", // Not specified
    certificationFiles: [],
    availability: [], // Would need to parse schedule text into structured days
    tags: ["nutrition", "naturopathie"],
    status: "active",
    permissions: [], // Not available
    loginDetails: {
      otpVerified: false,
      lastLogin: "",
      loginCount: 0,
      deviceInfo: "",
    },
    createdBy: "",
    createdAt: "",
    updatedBy: [],
  },
  {
    _id: "s26",
    name: "Coline Bosquet",
    phoneNumber: "0477/55 63 79",
    email: "coline.bosquet@animacorpus.be",
    gender: "female", // Assumed
    languages: ["lang-002"], // Assuming lang-002 = French
    address: {
      line1: "15 Place de l'Orneau",
      city: "Gembloux",
      zipCode: "5030",
      country: "Belgium",
    },
    dob: "", // Not provided
    description:
      "Je suis diplômée en ergothérapie et passionnée par l’accompagnement des enfants et des jeunes. Forte de plusieurs années d’expérience au sein d'un centre de rééducation ambulatoire spécialisé dans l’accompagnement des enfants autistes, j'ai acquis une expertise précieuse dans la prise en charge des enfants et des jeunes.",
    roleId: "role-003", // Custom assumed role for therapist
    accessLevelId: "al-001", // staff
    branches: [{ id: "b2", isPrimary: true }],
    selectedBranch: "b2",
    specialization: "Ergothérapeute",
    experience: "", // Not specifically defined
    education: "Diplôme en ergothérapie", // Inferred
    registrationNumber: "65313860650", // From specializations
    certificationFiles: [],
    availability: [
      { day: "Tuesday", from: "13:00", to: "18:00" },
      { day: "Wednesday", from: "09:00", to: "18:00" },
    ],
    tags: ["children", "autism", "motor-skills", "independence"],
    status: "active",
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: "",
      loginCount: 0,
      deviceInfo: "",
    },
    createdBy: "",
    createdAt: "",
    updatedBy: [],
  },
  {
    _id: "s20",
    name: "Adeline Tresnie",
    phoneNumber: "0499/47.75.08",
    email: "adeline.tresnie@animacorpus.be",
    gender: "female", // Assumed
    languages: ["lang-002"], // Assuming lang-002 = French
    address: {
      line1: "15 Place de l'Orneau",
      city: "Gembloux",
      zipCode: "5030",
      country: "Belgium",
    },
    dob: "", // Not provided
    description:
      "Depuis toujours, je suis passionnée par le développement humain et la compréhension du fonctionnement cérébral. Cet intérêt m’a naturellement guidée vers des études de psychologie à l’Université de Mons [...] tout en veillant à offrir un soutien personnalisé et efficace.",
    roleId: "role-003", // Assumed therapist role
    accessLevelId: "al-001", // staff
    branches: [{ id: "b2", isPrimary: true }],
    selectedBranch: "b2",
    specialization: "Neuropsychologue",
    experience: "", // Not specific
    education: "Master en sciences psychologiques, à finalité spécialisée",
    registrationNumber: "", // Not clearly available
    certificationFiles: [],
    availability: [
      { day: "Friday", from: "09:00", to: "18:00" },
      { day: "Saturday", from: "09:00", to: "18:00" },
    ],
    tags: [
      "enfants",
      "adolescents",
      "adultes",
      "bilan neuropsychologique",
      "mémoire",
      "concentration",
      "méthode de travail",
      "QI",
    ],
    status: "active",
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: "",
      loginCount: 0,
      deviceInfo: "",
    },
    createdBy: "",
    createdAt: "",
    updatedBy: [],
  },
  {
    _id: "s6",
    name: "Victoria Davi",
    phoneNumber: "0494/29.41.45",
    email: "victoria.davi@animacorpus.be",
    gender: "female", // Assumed
    languages: ["lang-002"], // Assuming lang-002 = French
    address: {
      line1: "15 Place de l'Orneau",
      city: "Gembloux",
      zipCode: "5030",
      country: "Belgium",
    },
    dob: "", // Not provided
    description:
      "Je suis psychologue clinicienne, diplômée d’un master en psychologie clinique et psychopathologies à l’Université Libre de Bruxelles. Mon objectif au sein du centre « Anima Corpus » est d'accompagner vos enfants et adolescents dans leur développement et leur bien-être.\n\nChaque enfant, adolescent étant unique, je m'efforce de créer un environnement sûr et bienveillant dans lequel ils pourront s'exprimer librement et en toute confiance. Mon objectif est de les aider à développer des compétences et des outils pour faire face aux défis de la vie tout en renforçant leur estime de soi.\n\nSoucieuse de la qualité de la prise en charge des patients que je rencontre, je m’inscris dans une démarche de formation continue.",
    roleId: "role-003", // Assumed therapist role
    accessLevelId: "al-001", // Staff
    branches: [{ id: "b2", isPrimary: true }],
    selectedBranch: "b2",
    specialization: "Psychologue clinicienne",
    experience: "", // Not mentioned
    education:
      "Master de psychologie clinique et psychopathologies, Université Libre de Bruxelles",
    registrationNumber: "", // Not available
    certificationFiles: [],
    availability: [
      { day: "Monday", from: "10:00", to: "18:00" },
      { day: "Tuesday", from: "10:00", to: "17:30" },
    ],
    tags: [
      "enfants",
      "adolescents",
      "psychothérapie",
      "EMDR",
      "douleurs chroniques",
      "cognitivo-comportementale",
    ],
    status: "active",
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: "",
      loginCount: 0,
      deviceInfo: "",
    },
    createdBy: "",
    createdAt: "",
    updatedBy: [],
  },
  {
    _id: "s25",
    name: "Marie Durieux",
    phoneNumber: "0471/58.97.12",
    email: "marie.durieux@animacorpus.be",
    gender: "female", // Assumed
    languages: ["lang-002"], // Assuming "Français" maps to "lang-002"
    address: {
      line1: "15 Place de l'Orneau",
      city: "Gembloux",
      zipCode: "5030",
      country: "Belgium",
    },
    dob: "", // Not provided
    description:
      "Kinésithérapeute diplômée de l'Université Catholique de Louvain en 2014, je me suis spécialisée en pédiatrie en 2015. J'ai travaillé 8 ans en milieu hospitalier (gériatrie, oncologie, chirurgie, etc.) puis me suis réorientée en hypnose médicale via l'ULB.",
    roleId: "role-003", // Assuming therapist or hypnotherapist role
    accessLevelId: "al-001", // Assuming basic staff
    branches: [{ id: "b2", isPrimary: true }], // Gembloux
    selectedBranch: "b2",
    specialization: "Hypnothérapeute",
    experience: "", // Not specified
    education:
      "Diplôme en kinésithérapie, UCLouvain; Certificat en hypnose médicale, ULB",
    registrationNumber: "", // Not available
    certificationFiles: [],
    availability: [], // No structured hours provided
    tags: [
      "hypnothérapie",
      "douleurs chroniques",
      "anxiété",
      "burn-out",
      "sommeil",
      "addictions",
      "TDAH",
      "enfants",
      "adultes",
    ],
    status: "active",
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: "",
      loginCount: 0,
      deviceInfo: "",
    },
    createdBy: "",
    createdAt: "",
    updatedBy: [],
  },
  {
    _id: "s13",
    name: "Lise Langlois",
    phoneNumber: "33646/33.04.07",
    email: "lise.langlois@animacorpus.be",
    gender: "female", // Assumed
    languages: ["lang-002"], // Français
    address: {
      line1: "15 Place de l'Orneau",
      city: "Gembloux",
      zipCode: "5030",
      country: "Belgium",
    },
    dob: "", // Not provided
    description:
      "Master en logopédie à l'UCL, spécialisée en aphasie et troubles neuro-développementaux. Passionnée par l'accompagnement des personnes en difficulté de langage et de communication.",
    roleId: "role-003", // Assuming therapist or speech therapist (logopède)
    accessLevelId: "al-001",
    branches: [{ id: "b2", isPrimary: true }], // Gembloux
    selectedBranch: "b2",
    specialization: "Logopède",
    experience: "", // Not specified
    education:
      "Master en logopédie, UCL, spécialisation aphasie et troubles neuro-développementaux",
    registrationNumber: "", // Not provided
    certificationFiles: [],
    availability: [], // No structured hours provided
    tags: [
      "logopédie",
      "aphasie",
      "dyslexie",
      "dyscalculie",
      "dysorthographie",
      "dysphasie",
      "troubles neuro-développementaux",
      "maladies neuro-dégénératives",
    ],
    status: "active",
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: "",
      loginCount: 0,
      deviceInfo: "",
    },
    createdBy: "",
    createdAt: "",
    updatedBy: [],
  },
  {
    _id: "s19",
    name: "Dinahlee Moreau",
    phoneNumber: "0466/42.88.66",
    email: "dinahlee.moreau@animacorpus.be",
    gender: "female", // Assumed
    languages: ["lang-002"], // Français
    address: {
      line1: "15 Place de l'Orneau",
      city: "Gembloux",
      zipCode: "5030",
      country: "Belgium",
    },
    dob: "", // Not provided
    description:
      "Neuropsychologue spécialisée dans les troubles neurodéveloppementaux et neurodégénératifs. Réalise des bilans cognitifs complets (QI, attention, mémoire, fonctions exécutives) et accompagne enfants, adultes et personnes âgées.",
    roleId: "role-003", // Assuming therapist/neuropsychologist
    accessLevelId: "al-001",
    branches: [
      { id: "b2", isPrimary: true }, // Anima Corpus Gembloux
      { id: "b3", isPrimary: false }, // CNR 542 Montigny-le-Tilleul — optionally define this as a separate branch
    ],
    selectedBranch: "b2",
    specialization: "Neuropsychologue",
    experience: "", // Not specified directly
    education:
      "Master en Psychologie clinique spécialisée en Neuropsychologie, Université Catholique de Louvain",
    registrationNumber: "", // Not provided
    certificationFiles: [],
    availability: [
      {
        day: "Tuesday",
        from: "08:00",
        to: "14:00",
      },
      {
        day: "Friday",
        from: "08:00",
        to: "20:30",
      },
      {
        day: "Wednesday",
        from: "08:00",
        to: "18:00",
      },
      {
        day: "Thursday",
        from: "08:00",
        to: "18:00",
      },
    ],
    tags: [
      "neuropsychologie",
      "bilans cognitifs",
      "troubles neurodéveloppementaux",
      "troubles neurodégénératifs",
      "QI",
      "TDAH",
      "HPI",
      "Alzheimer",
      "Parkinson",
      "guidance parentale",
      "accompagnement scolaire",
    ],
    status: "active",
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: "",
      loginCount: 0,
      deviceInfo: "",
    },
    createdBy: "",
    createdAt: "",
    updatedBy: [],
  },
  {
    _id: "s11",
    name: "Alice Lechanteur",
    phoneNumber: "0493/42.61.16",
    email: "alice.lechanteur@animacorpus.be",
    gender: "female",
    languages: ["lang-002"], // Français
    address: {
      line1: "Place de l'Orneau 15",
      city: "Gembloux",
      zipCode: "5030",
      country: "Belgium",
    },
    dob: "",
    description:
      "Logopède prenant en charge les enfants dès 3 ans, les adultes et les personnes âgées. Elle propose bilans langagiers, vocaux, et séances de rééducation. Guidance parentale et aménagements personnalisés possibles.",
    roleId: "role-006", // Logopède
    accessLevelId: "al-001",
    branches: [{ id: "b2", isPrimary: true }], // Anima Corpus Gembloux
    selectedBranch: "b2",
    specialization: "Logopède",
    experience: "",
    education: "Numéro INAMI: 60896501802",
    registrationNumber: "60896501802",
    certificationFiles: [],
    availability: [], // No detailed schedule provided
    tags: [
      "logopède",
      "langage oral",
      "langage écrit",
      "dyslexie",
      "troubles oro-pédiatriques",
      "difficultés vocales",
      "pathologies neurodégénératives",
      "guidance parentale",
    ],
    status: "active",
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: "",
      loginCount: 0,
      deviceInfo: "",
    },
    createdBy: "",
    createdAt: "",
    updatedBy: [],
  },
  {
    _id: "s3",
    name: "Constance Darcheville",
    phoneNumber: "0498/66.93.18",
    email: "constance.darcheville@animacorpus.be",
    gender: "female",
    languages: ["lang-002"], // Français
    address: {
      line1: "Place de l'Orneau 15",
      city: "Gembloux",
      zipCode: "5030",
      country: "Belgium",
    },
    dob: "",
    description:
      "Psychologue clinicienne spécialisée dans les soins palliatifs, le post-partum et la pleine conscience. Elle accompagne les adultes dans leurs difficultés personnelles, stress, deuils ou burn-out. Consultations disponibles également à Haumea (Gembloux).",
    roleId: "role-004", // Psychologue clinicienne
    accessLevelId: "al-001",
    branches: [
      { id: "b2", isPrimary: true }, // Anima Corpus Gembloux
      { id: "b4", isPrimary: false }, // Haumea - Chaussée de Charleroi 79
    ],
    selectedBranch: "b2",
    specialization: "Psychologue clinicienne",
    experience: "",
    education:
      "Master en Psychologie - UCL\nCertificat en soins palliatifs - UCL\nCertificat en Interventions psychologiques basée sur la Pleine Conscience - UCL\nFormations diverses (burn-out parental, post-partum, etc.)",
    registrationNumber: "70101702000",
    certificationFiles: [],
    availability: [
      {
        day: "Tuesday",
        from: "09:00",
        to: "18:30",
      },
      {
        day: "Thursday",
        from: "09:00",
        to: "16:00",
      },
      {
        day: "Friday",
        from: "09:00",
        to: "16:00",
      },
      {
        day: "Monday",
        from: "09:00",
        to: "13:00",
      },
    ],
    tags: [
      "psychologue",
      "pleine conscience",
      "post-partum",
      "burn-out parental",
      "soins palliatifs",
      "adultes",
      "stress",
      "accompagnement émotionnel",
    ],
    status: "active",
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: "",
      loginCount: 0,
      deviceInfo: "",
    },
    createdBy: "",
    createdAt: "",
    updatedBy: [],
  },
  {
    _id: "s27",
    name: "Emeline Gillmann",
    phoneNumber: "0456 89 04 99",
    email: "emeline.gillmann@animacorpus.be",
    gender: "female",
    languages: ["lang-001", "lang-002"], // Néerlandais, Français
    address: {
      line1: "Place de l'Orneau 15",
      city: "Gembloux",
      zipCode: "5030",
      country: "Belgium",
    },
    dob: "",
    description:
      "Kinésiologue pour toute la famille (bébés, enfants, ados, adultes, seniors). Approche psycho-corporelle douce pour libérer les stress et retrouver un équilibre intérieur durable.",
    roleId: "role-009", // Kinésiologue
    accessLevelId: "al-001",
    branches: [{ id: "b2", isPrimary: true }], // Anima Corpus Gembloux
    selectedBranch: "b2",
    specialization: "Kinésiologie",
    experience: "",
    education:
      "Kinésiologue Certifiée FBK (1000+ heures): Touch for Health, Stress Release, SIPS, Brain Gym, Three in One Concepts, Core Kinesiology, Reiki (3e), Wellness Coach, Pleine Conscience, Master en Sciences du Travail",
    registrationNumber: "",
    certificationFiles: [],
    availability: [
      {
        day: "Monday",
        from: "14:30",
        to: "20:30",
      },
      {
        day: "Thursday",
        from: "09:00",
        to: "14:00",
      },
      {
        day: "Friday",
        from: "09:00",
        to: "14:00",
      },
    ],
    tags: [
      "kinésiologie",
      "gestion du stress",
      "troubles du sommeil",
      "difficultés relationnelles",
      "troubles de l’apprentissage",
      "préparation examens",
      "douleurs chroniques",
      "équilibre émotionnel",
      "confiance en soi",
      "bien-être global",
    ],
    status: "active",
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: "",
      loginCount: 0,
      deviceInfo: "",
    },
    createdBy: "",
    createdAt: "",
    updatedBy: [],
  },
  {
    _id: "s12",
    name: "Pauline Roberfroid",
    phoneNumber: "0493/29.15.15",
    email: "pauline.roberfroid@animacorpus.be",
    gender: "female",
    languages: ["lang-002"], // Français
    address: {
      line1: "Place de l'Orneau 15",
      city: "Gembloux",
      zipCode: "5030",
      country: "Belgium",
    },
    dob: "",
    description:
      "Logopède spécialisée en troubles du langage d’origine neurologique et en revalidation pour enfants et adultes. Bienveillante et investie dans l'accompagnement thérapeutique personnalisé.",
    roleId: "role-006", // Logopède
    accessLevelId: "al-001",
    branches: [{ id: "b2", isPrimary: true }], // Anima Corpus Gembloux
    selectedBranch: "b2",
    specialization: "Logopédie neurologique",
    experience: "",
    education:
      "Diplôme en logopédie - Haute École Léonard de Vinci & UCLouvain\nMaster de spécialisation en troubles du langage neurologique\nNuméro INAMI: 60785544802",
    registrationNumber: "60785544802",
    certificationFiles: [],
    availability: [
      {
        day: "Tuesday",
        from: "14:30",
        to: "18:00",
      },
      {
        day: "Wednesday",
        from: "09:00",
        to: "18:00",
      },
    ],
    tags: [
      "logopède",
      "aphasie",
      "dysarthrie",
      "dysphagie",
      "troubles neurodégénératifs",
      "dyslexie",
      "dyscalculie",
      "troubles du langage oral",
      "troubles articulatoires",
      "enfants",
      "adultes",
    ],
    status: "active",
    permissions: [],
    loginDetails: {
      otpVerified: false,
      lastLogin: "",
      loginCount: 0,
      deviceInfo: "",
    },
    createdBy: "",
    createdAt: "",
    updatedBy: [],
  },
];
