export interface AddressType {
  street: string;
  city: string;
  zip_code: string;
  country: string;
}

export interface TeamType {
  ID_Pro: string;               // Professional ID
  LastName: string;             // Last Name
  FirstName: string;            // First Name
  NomComplet: string;           // Full Name (Nom complet)
  Function: string;             // Main Function
  PublicSpecific: string;       // Public Specific
  Specialisation: string;       // Primary Specialisation
  Function2?: string;           // Additional Function 2
  Function3?: string;           // Additional Function 3
  Function4?: string;           // Additional Function 4
  WhoAmI: string;               // Self-description
  Consultations: string;        // Consultation details
  Address: AddressType;         // Full Address
  ContactMail: string;          // Email
  PhoneNumber: string;          // Phone number
  Hourly: string;               // Hourly rate info
  About: string;                // About section
  LanguesParlees: string;       // Spoken languages
  PaymentMethod: string;        // Payment method
  DiplomasTrainings: string;    // Diplomas and Trainings
  Specialisations: string;      // Other specialisations
  Website: string;              // Website link
  FAQ: string;                  // FAQ section
  LiensAgenda: string;          // External calendar / agenda links
  Photo: string;                // Photo URL or file reference

  // Optional meta / backend-required fields
  created_by?: number;          // User ID that created the entry
  status?: 'active' | 'inactive';
  permissions?: Array<{
    _id: string;
    action?: string;
    resource?: string;
    enabled: boolean;
  }>;
}
