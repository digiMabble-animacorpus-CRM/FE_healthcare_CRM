import { currency } from '@/context/constants'

export type FamilyMember = {
  name: string
  relation: string
  age: number
}

export type AppointmentDetails = {
  date: string
  time?: string
  purpose: string
  status: string
}

export type CustomerType = {
  title: string
  propertyCount: number
  icon: string
  countDisplay: string
  progress: number
  variant: string
  count?: number
}

export type CustomerEnquiriesType = {
  _id: string
  name: string
  dob: string
  gender: string
  email: string
  number: string
  branch: string
  status: string
  address: string
  description: string
  tags?: string[]
  familyDetails?: FamilyMember[]
  appointmentDetails?: AppointmentDetails
}

export const customerData: CustomerType[] = [
  {
    title: 'Active Property',
    propertyCount: 350,
    icon: 'solar:home-2-bold',
    countDisplay: '231',
    progress: 60,
    variant: 'success',
  },
  {
    title: 'View Property',
    propertyCount: 231,
    icon: 'solar:home-bold',
    countDisplay: '27',
    progress: 20,
    variant: 'warning',
  },
  {
    title: 'Own Property',
    propertyCount: 27,
    icon: 'solar:money-bag-bold',
    countDisplay: `${currency}928,128`,
    progress: 80,
    variant: 'primary',
  },
];

// Dummy customer enquiry data with familyDetails and appointmentDetails

export const sampleCustomerEnquiry: CustomerEnquiriesType = {
  _id: 'cust-001',
  name: 'John Doe',
  dob: '1985-06-15',
  gender: 'Male',
  email: 'john.doe@example.com',
  number: '+1 555 123 4567',
  branch: 'Downtown',
  status: 'new',
  address: '123 Main St, Springfield',
  description: 'Interested in 3-bedroom properties within city limits.',
  tags: ['VIP', 'Priority'],
  familyDetails: [
    { name: 'Jane Doe', relation: 'Spouse', age: 38 },
    { name: 'Jimmy Doe', relation: 'Son', age: 10 },
    { name: 'Jill Doe', relation: 'Daughter', age: 6 },
  ],
  appointmentDetails: {
    date: '2025-08-20',
    time: '3:00 PM',
    purpose: 'Initial Property Viewing',
    status: 'Scheduled',
  },
};
