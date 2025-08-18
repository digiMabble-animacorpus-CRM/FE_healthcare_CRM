import { StaticImageData } from 'next/image';
import { BootstrapVariantType } from './component-props';
export type IdType = string;

export type EmailLabelType = 'Primary' | 'Social' | 'Promotions' | 'Updates' | 'Forums';

export type EmailType = {
  id: IdType;
  fromId: UserType['id'];
  from?: UserType;
  toId: UserType['id'];
  to?: UserType;
  subject?: string;
  content?: string;
  attachments?: FileType[];
  label?: EmailLabelType;
  starred?: boolean;
  important?: boolean;
  draft?: boolean;
  deleted?: boolean;
  read?: boolean;
  createdAt: Date;
};

export type ReviewType = {
  count: number;
  stars: number;
};

export type Employee = {
  id: IdType;
  name: string;
  email: string;
  position: string;
  company: string;
  country: string;
};

export type NotificationType = {
  from: string;
  content: string;
  icon?: StaticImageData;
};

export type UserType = {
  id: IdType;
  name: string;
  avatar: StaticImageData;
  email: string;
  mutualCount: number;
  contact: string;
  activityStatus: 'typing' | 'online' | 'offline';
  languages: string[];
  status?: 'Active' | 'Inactive';
  address?: string;
  message?: string;
  time: Date;
  hasRequested?: boolean;
  chatIcon?: string;
  location: string;
  emailMessage?: string;
};

export type PatientType = {
  branch: string;
  visits: number;
  prescriptions: number;
  bills: number;
  createdAt?: string;
  _id?: IdType;
  birthdate: string;
  city?: string;
  country?: string;
  emails?: string;
  firstname: string;
  id: string;
  language?: string;
  lastname: string;
  legalgender?: string;
  middlename?: string;
  mutualitynumber?: string;
  mutualityregistrationnumber?: string;
  note?: string;
  number?: string;
  phones?: string[];
  primarypatientrecordid?: string;
  ssin?: string;
  status?: string;
  street?: string;
  zipcode?: string;
};

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export type AppointmentSource = 'phone' | 'website' | 'walk_in' | 'referral' | 'other';

export interface AppointmentType {
  _id: string; // Unique appointment ID
  customerId: string; // Linked to Customer
  branchId: string; // Linked to Branch
  assignedStaffId?: string; // Optional assigned staff

  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24-hour)

  service?: string; // Purpose / Service
  notes?: string; // Optional notes

  status: AppointmentStatus; // scheduled, completed, cancelled, no_show
  cancelledReason?: string; // Reason if cancelled

  source?: AppointmentSource; // How appointment was booked
  reminderSent?: boolean; // SMS/Email reminder flag

  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export type BranchType = {
  _id: string;

  name: string;
  code?: string;
  email?: string;
  phoneNumber?: string;
  address?: Address;
  status: 'active' | 'inactive';

  createdBy: string;
  updatedBy: {
    staffId: string;
    updatedAt: string;
  }[];

  createdAt: string;
};

export type PermissionType = {
  _id: string;
  key: string;
  label: string;
  description?: string;
  category?: string;
};

export type StaffRoleType = {
  _id: string;
  tag: 'Role' | 'AccessLevel';
  key: string;
  label: string;
  description?: string;
  defaultPermissions?: string[];
  defaultPermissionsDetailed?: PermissionType[];
  internal?: boolean;
  requiresDetails?: boolean;
  requiresAvailability?: boolean;
};

export type AccessLevelType = StaffRoleType;
// export type PermissionType =
//   | "view-patients"
//   | "edit-patients"
//   | "manage-appointments"
//   | "prescribe-meds"
//   | "manage-inventory"
//   | "access-billing"
//   | "admin-access"
//   | "custom";

export type StaffRole =
  | ''
  | 'Therapist'
  | 'Doctor'
  | 'Nurse'
  | 'Receptionist'
  | 'Admin'
  | 'Pharmacist'
  | 'Technician'
  | 'SupportStaff'
  | 'LabTechnician'
  | 'Assistant'
  | 'Other';

export type AvailabilitySlot = {
  day: string; // "Monday"
  from: string; // "09:00"
  to: string; // "14:00"
};

export type LanguageType = {
  _id: string;
  key: string;
  label: string;
};

export type Language = 'french' | 'dutch' | 'english';

export type Address = {
  line1?: string; // street
  street?: string;
  line2?: string;
  city: string;
  zip_code: string;
  country: string;
};

export type StaffType = {
  [x: string]: any;
  _id?: string;
  name: string;
  phoneNumber: string;
  // phone_number: string;
  email: string;

  gender: string;
  languages: string[];

  address?: Address;
  description?: string;
  dob?: string;

  roleId: string;
  accessLevelId?: string;

  //  branchesDetailed: {
  //   code: string;
  //   name?: string; // optional if not used
  // }[];

  branches: { id: string; isPrimary?: boolean }[];
  selectedBranch: string;
  specialization?: string;
  experience?: string;
  education?: string;
  registrationNumber?: string;

  certificationFiles?: {
    path: string;
    preview: string | null;
    formattedSize: string;
  }[];

  availability?: AvailabilitySlot[];
  tags?: string[];
  status: 'active' | 'inactive';

  permissions: {
    _id: string;
    enabled: boolean;
  }[];

  loginDetails: {
    otpVerified: boolean;
    lastLogin?: string;
    loginCount?: number;
    deviceInfo?: string;
  };

  createdBy: string;
  createdAt: string;

  updatedBy: {
    staffId: string;
    updatedAt: string;
  }[];
};

export type BranchDetails = {
  id: number;
  name: string;
  code: string;
};

export type TherapistType = {
  _key: number;
  idPro: number;
  firstName: string;
  lastName: string;
  fullName: string;
  photo: string;
  jobTitle: string;
  targetAudience?: string | null;
  specialization1?: string | null;
  specialization2?: string | null;
  aboutMe: string;
  consultations: string;
  centerAddress: string;
  centerEmail: string;
  centerPhoneNumber: string;
  contactEmail: string;
  contactPhone: string;
  schedule: string;
  about?: string | null;
  spokenLanguages: string;
  paymentMethods?: string;
  degreesAndTraining: string;
  specializations: string;
  website: string;
  faq: string;
  agendaLinks: string | null;
  rosaLink?: string | null;
  googleAgendaLink?: string | null;
  appointmentStart?: string | null;
  appointmentEnd?: string | null;
  appointmentAlert?: string | null;
  availability?: any | null;
  tags?: any;
};

export type TherapistCreatePayload = {
  firstName: string;
  lastName: string;
  fullName: string;
  photo?: string;
  jobTitle: string;
  targetAudience?: string | null;
  specialization1?: string | null;
  specialization2?: string | null;
  aboutMe: string;
  consultations?: string;
  centerAddress: string;
  centerEmail: string;
  centerPhoneNumber: string;
  contactEmail: string;
  contactPhone: string;
  schedule?: string;
  about?: string | null;
  spokenLanguages: string;
  paymentMethods?: string;
  degreesAndTraining: string;
  specializations: string;
  website?: string;
  faq?: string;
  agendaLinks?: string | null;
  rosaLink?: string | null;
  googleAgendaLink?: string | null;
  appointmentStart?: string | null;
  appointmentEnd?: string | null;
  appointmentAlert?: string | null;
  availability?: any[];
  tags?: string[];
  certificationFiles?: File[];
  branches?: (string | number)[];
  selected_branch?: string | number | null;
};

export type AgentType = {
  id: IdType;
  address: string;
  userId: UserType['id'];
  user?: UserType;
  experience: number;
  properties: number;
  date: Date;
};

export type TransactionType = {
  id: IdType;
  invoiceNumber: string;
  purchaseDate: Date;
  description: string;
  status: 'Cr' | 'Dr';
  userId: UserType['id'];
  user?: UserType;
  propertyId: PropertyType['id'];
  property?: PropertyType;
  amount: string;
  paymentType: 'Mastercard' | 'Visa' | 'Paypal';
  paymentStatus: 'Completed' | 'Cancel' | 'Pending';
  orderId: string;
  agentName: string;
  amountStatus: 'Paid' | 'Unpaid' | 'Pending';
  investedProperty: string;
  paymentMethod: {
    card: StaticImageData;
    name: string;
  };
};

export type PropertyType = {
  id: IdType;
  icon: string;
  image: StaticImageData;
  name: string;
  propertyType: string;
  location: string;
  beds: number;
  bath: number;
  flor: number;
  size: number;
  price: string;
  country: string;
  type: 'Rent' | 'Sold' | 'Sale';
  variant: string;
  save?: boolean;
};

export type CustomerType = {
  id: IdType;
  propertyType: string;
  userId: UserType['id'];
  user?: UserType;
  interestedProperties: string;
  customerStatus: 'Interested' | 'Under Review' | 'Follow-up';
  date: Date;
  status: 'Available' | 'Unavailable';
  propertyView: number;
  propertyOwn: number;
  invest: string;
};

export type CustomerReviewsType = {
  name: string;
  email: string;
  number: string;
  dob: string;
  description: string;
  address: string;
  zip_code: string;
  gender: string;
  language: string;
  branch: string;
  tags: never[];
  city: string;
  country: string;
  id: IdType;
  rating: number;
  userId: UserType['id'];
  user?: UserType;
  propertyId: PropertyType['id'];
  property?: PropertyType;
  review: {
    title: string;
    description: string;
  };
  reviewStatus: 'Published' | 'Pending';
  date: Date;
};

export type FileType = Partial<File> & {
  preview?: string;
};

export type ChatMessageType = {
  id: IdType;
  from: UserType;
  to: UserType;
  message: {
    type: 'file' | 'text';
    value: FileType[] | string;
  };
  sentOn?: Date;
};

export type ActivityType = {
  title: string;
  icon?: string;
  variant?: BootstrapVariantType;
  status?: 'completed' | 'latest';
  files?: FileType[];
  time: Date;
  type?: 'task' | 'design' | 'achievement';
  content?: string;
};

export type SocialEventType = {
  id: IdType;
  title: string;
  venue: string;
  type: 'togetherness' | 'celebration' | 'professional';
  image: StaticImageData;
  startsAt: Date;
};

export type GroupType = {
  id: IdType;
  name: string;
  description: string;
  time: Date;
  groupName: string;
  change?: number;
  variant: string;
};

export type EmailCountType = {
  inbox: number;
  starred: number;
  draft: number;
  sent: number;
  deleted: number;
  important: number;
};

export type TimelineType = {
  [key: string]: {
    title: string;
    description: string;
    important?: boolean;
  }[];
};

export type PricingType = {
  id: IdType;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  subscribed?: boolean;
};

export type ProjectType = {
  id: IdType;
  projectName: string;
  client: string;
  teamMembers: StaticImageData[];
  deadlineDate: Date;
  progressValue: number;
  variant: string;
};

export type TodoType = {
  id: IdType;
  task: string;
  createdAt: Date;
  dueDate: Date;
  status: 'Pending' | 'In-Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  employeeId: SellerType['id'];
  employee?: SellerType;
};

export type SellerType = {
  id: IdType;
  name: string;
  image: StaticImageData;
  storeName: string;
  review: ReviewType;
  productsCount: number;
  walletBalance: number;
  createdAt: Date;
  revenue: number;
};

export type ProfileType = {
  _key: number;
  idPro: number;
  firstName: string;
  lastName: string;
  fullName: string;
  photo: string;
  jobTitle: string;
  targetAudience?: string | null;
  specialization1?: string | null;
  specialization2?: string | null;
  aboutMe: string;
  consultations: string;
  centerAddress: string;
  centerEmail: string;
  centerPhoneNumber: string;
  contactEmail: string;
  contactPhone: string;
  schedule: string;
  about?: string | null;
  spokenLanguages: string;
  paymentMethods?: string;
  degreesAndTraining: string;
  specializations: string;
  website: string;
  faq: string;
  agendaLinks: string | null;
  rosaLink?: string | null;
  googleAgendaLink?: string | null;
  appointmentStart?: string | null;
  appointmentEnd?: string | null;
  appointmentAlert?: string | null;
  availability?: any | null;
  tags?: any;
};

export type ProfileCreatePayload = {
  firstName: string;
  lastName: string;
  fullName: string;
  photo?: string;
  jobTitle: string;
  targetAudience?: string | null;
  specialization1?: string | null;
  specialization2?: string | null;
  aboutMe: string;
  consultations?: string;
  centerAddress: string;
  centerEmail: string;
  centerPhoneNumber: string;
  contactEmail: string;
  contactPhone: string;
  schedule?: string;
  about?: string | null;
  spokenLanguages: string;
  paymentMethods?: string;
  degreesAndTraining: string;
  specializations: string;
  website?: string;
  faq?: string;
  agendaLinks?: string | null;
  rosaLink?: string | null;
  googleAgendaLink?: string | null;
  appointmentStart?: string | null;
  appointmentEnd?: string | null;
  appointmentAlert?: string | null;
  availability?: any[];
  tags?: string[];
  certificationFiles?: File[];
  branches?: (string | number)[];
  selected_branch?: string | number | null;
};
