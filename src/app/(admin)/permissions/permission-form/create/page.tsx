'use client';

import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import type { PermissionType } from '@/types/data';
import PermissionForm from '../permissionForm';

const CreatePermissionPage = () => {
  const router = useRouter();

  const handleCreate = async (data: Omit<PermissionType, '_id'>) => {
    try {
      // 🔧 Replace this with your real API integration
      console.log('Creating Permission...', data);
      // await createPermissionAPI(data);

      toast.success('Permission created successfully!');
      router.push('/permissions');
    } catch (error) {
      toast.error('Failed to create Permission.');
    }
  };

  return <PermissionForm onSubmitHandler={handleCreate} />;
};

export default CreatePermissionPage;
