'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PermissionType } from '@/types/data';
import PermissionForm from '../../permissionForm';
import { getPermissionById } from '@/helpers/permission';

interface Props {
  params: { id?: string };
}

const EditPermissionPage = ({ params }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<Partial<PermissionType>>({});
  const isEditMode = Boolean(params.id);

  useEffect(() => {
    if (!params.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data } = await getPermissionById(params.id);
        const permission = Array.isArray(data) ? data[0] : data;
        if (permission?._id) {
          setDefaultValues(permission);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const onSubmitHandler = async (data: Omit<PermissionType, '_id'>) => {
    try {
      // await updatePermission(params.id as string, data);
      router.push('/permissions');
    } catch {
      console.error('Error updating permission');
    }
  };

  if (loading) return <div>Loading permission details...</div>;

  return (
    <PermissionForm defaultValues={defaultValues} isEditMode onSubmitHandler={onSubmitHandler} />
  );
};

export default EditPermissionPage;
