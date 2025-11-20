export interface Patient {
  id: string;
  externalId?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  ssin?: string;
  legalGender?: string;
  birthdate?: {
    year: number;
    month: number;
    day: number;
  };
  language?: string;
  contactInfos?: {
    value: string;
    type: "EMAIL" | "PHONE" | "FAX" | "OTHER";
    description?: string;
    isPrimary?: boolean;
    isEmergency?: boolean;
    isVerified?: boolean;
  }[];
  note?: string;
  address?: {
    street: string;
    number?: string;
    city: string;
    zipCode?: string;
    country: string;
  };
  status?: string; // ACTIVE, INACTIVE, etc.
}
