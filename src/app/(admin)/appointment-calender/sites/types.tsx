export interface Site {
  id: string;
  name: string;
  address?: {
    street: string;
    number?: string;
    city: string;
    zipCode: string;
    country: string;
    coords?: { lat: number; lng: number };
  };
  contactInfos?: {
    value: string;
    type: "EMAIL" | "PHONE" | "FAX" | "OTHER";
    description?: string;
    isPrimary?: boolean;
    isEmergency?: boolean;
    isVerified?: boolean;
  }[];
}
