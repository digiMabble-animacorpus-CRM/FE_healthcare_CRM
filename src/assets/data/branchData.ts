import { BranchType } from '@/types/data';

export const branches: BranchType[] = [
  {
    _id: 'b1',
    name: 'Gembloux - Orneau',
    code: 'ORN',
    email: 'orneau@gembloux.com',
    phoneNumber: '+32 123456789',
    address: {
      street: '123 Orneau Street',
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
    _id: 'b2',
    name: 'Gembloux - Tout Vent',
    code: 'TTV',
    email: 'toutvent@gembloux.com',
    phoneNumber: '+32 987654321',
    address: {
      street: '456 Tout Vent Avenue',
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
    _id: 'b3',
    name: 'Anima Corpus Namur',
    code: 'NAM',
    email: 'namur@animacorpus.com',
    phoneNumber: '+32 112233445',
    address: {
      street: '789 Namur Blvd',
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
