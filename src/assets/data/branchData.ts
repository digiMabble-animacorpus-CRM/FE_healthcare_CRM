import { BranchType } from '@/types/data';

export const branches: BranchType[] = [
  {
    branch_id: 1, // ✅ Added
    _id: 'b1',
    name: 'Gembloux - Orneau',
    code: 'ORN',
    email: 'gembloux@animacorpus.be',
    phoneNumber: '0492/40.18.77',
    address: {
      street: 'Place de l Orneau, 15',
      city: 'Gembloux',
      zip_code: '5030',
      country: 'Belgium',
    },
    status: 'active',
    createdBy: 's1',
    updatedBy: [],
    createdAt: '2024-12-15T10:30:00.000Z',
  },
  {
    branch_id: 2, // ✅ Added
    _id: 'b2',
    name: 'Gembloux - Tout Vent',
    code: 'TTV',
    email: 'gembloux@animacorpus.be',
    phoneNumber: '0492/40.18.77',
    address: {
      street: 'Chaussée de namur, 47',
      city: 'Gembloux',
      zip_code: '5030',
      country: 'Belgium',
    },
    status: 'active',
    createdBy: 's2',
    updatedBy: [
      {
        staffId: 's3',
        updatedAt: '2025-03-01T09:45:00.000Z',
      },
    ],
    createdAt: '2025-01-10T14:00:00.000Z',
  },
  {
    branch_id: 5, // ✅ Added
    _id: 'b3',
    name: 'Namur',
    code: 'NAM',
    email: 'namur@animacorpus.com',
    phoneNumber: '0492/40.18.77',
    address: {
      street: 'Av. Cardinal Mercier, 46',
      city: 'Namur',
      zip_code: '5000',
      country: 'Belgium',
    },
    status: 'active',
    createdBy: 's1',
    updatedBy: [],
    createdAt: '2025-02-05T08:15:00.000Z',
  },
];
