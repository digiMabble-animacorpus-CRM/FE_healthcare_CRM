'use client';

import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import type { StaffRoleType } from '@/types/data';
import dynamic from 'next/dynamic';

// Dynamic import prevents SSR from executing DOM-dependent code
const StaffRoleForm = dynamic(() => import('../staffRoleForm'), { ssr: false });

const CreateStaffRolePage = () => {
  const router = useRouter();

  const handleCreate = async (data: Omit<StaffRoleType, '_id'>) => {
    try {
      // toast.success('StaffRole created successfully!');
    } catch (error) {
      // toast.error('Failed to create StaffRole.');
    }
  };

  return <StaffRoleForm onSubmitHandler={handleCreate} />;
};

export default CreateStaffRolePage;
