// /appointments/types/appointment.ts
export interface PatientType {
    id: string;
    number: string;
    firstname: string;
    middlename: string;
    lastname: string;
    ssin: string;
    legalgender: string;
    language: string;
    birthdate: string;
    primarypatientrecordid: string;
    note: string;
    status: string;
    mutualitynumber: string;
    mutualityregistrationnumber: string;
    emails: string;
    country: string;
    city: string;
    street: string;
    phones: string[];
    zipcode: string;
    therapistId: string | null;
    created_at: string;
    is_delete: boolean;
    deleted_at: string | null;
  }
  
  export interface BranchType {
    branch_id: number;
    name: string;
    address: string;
    email: string;
    phone: string;
    location: string;
    is_active: boolean;
    created_at: string;
  }
  
  export interface DepartmentType {
    id: number;
    name: string;
    is_active: boolean;
    is_deleted: boolean;
    description: string;
  }
  
  export interface SpecializationType {
    specialization_id: number;
    specialization_type: string;
    description: string;
    is_active: boolean;
    created_at: string;
  }
  
  export interface TherapistType {
    therapistId: number;
    firstName: string;
    lastName: string;
    fullName: string;
    photo: string;
    imageUrl: string;
    contactEmail: string;
    contactPhone: string;
    aboutMe: string;
    degreesTraining: string;
    inamiNumber: string;
    paymentMethods: string;
    faq: string;
    departmentId: number;
    availability: AvailabilityType[];
    isDelete: boolean;
    deletedAt: string;
  }
  
  export interface AvailabilityType {
    day: string;
    startTime: string;
    endTime: string;
  }
  
  export interface AppointmentType {
    id: number;
    is_active: boolean;
    created_at: string;
    startTime: string;
    endTime: string;
    status: string;
    purposeOfVisit: string;
    description: string;
    branch: BranchType;
    patient: PatientType;
    therapist: TherapistType;
    department: DepartmentType;
    specialization: SpecializationType;
    createdBy: {
      team_id: string;
      last_name: string;
      first_name: string;
      full_name: string;
      job_1: string;
      specific_audience: string;
      specialization_1: string;
      job_2: string;
      job_3: string;
      job_4: string;
      who_am_i: string;
      consultations: string;
      office_address: string;
      contact_email: string;
      contact_phone: string;
      schedule: {
        text: string;
      };
      about: string;
      languages_spoken: string[];
      payment_methods: string[];
      diplomas_and_training: string[];
      specializations: string[];
      website: string;
      frequently_asked_questions: string;
      calendar_links: string[];
      photo: string;
      is_delete: boolean;
      deleted_at: string | null;
      role: string;
      permissions: Record<string, any>;
      status: string;
      created_by_role: string | null;
    };
    modifiedBy: any;
  }
  
  export interface AppointmentFormValues {
    branchId: number;
    departmentId: number;
    specializationId: number;
    therapistId: number;
    patientId?: string;
    date: string;
    time: string;
    purposeOfVisit: string;
    description?: string;
  }