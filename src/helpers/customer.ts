import { customerEnquiriesData } from '@/assets/data/other';
// import type { CustomerEnquiriesType } from '@/types/data';

export const getUserByEmail = (email: string): any | undefined => {
  return customerEnquiriesData.find((customer: { email: string; }) => customer.email === email);
};
