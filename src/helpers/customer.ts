import { customerEnquiriesData } from '@/assets/data/other';
import type { CustomerEnquiriesType } from '@/types/data';

export const getUserByEmail = (email: string): CustomerEnquiriesType | undefined => {
  return customerEnquiriesData.find((customer) => customer.email === email);
};
