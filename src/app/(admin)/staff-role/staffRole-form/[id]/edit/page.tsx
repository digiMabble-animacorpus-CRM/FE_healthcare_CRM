'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { StaffRoleType } from '@/types/data';
import StaffRoleForm from '../../staffRoleForm';
import { getStaffRoleById } from '@/helpers/staff';

interface Props {
  params: { id?: string };
}

const EditStaffRolePage = ({ params }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<Partial<StaffRoleType>>({});
  const isEditMode = Boolean(params.id);

  useEffect(() => {
    if (!params.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data } = await getStaffRoleById(params.id);
        const staffRole = Array.isArray(data) ? data[0] : data;
        if (staffRole?._id) {
          setDefaultValues(staffRole);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const onSubmitHandler = async (data: Omit<StaffRoleType, '_id'>) => {
    try {
      console.log('StaffRole updated', data);
      // await updateStaffRole(params.id as string, data)
      // router.push("/StaffRoles");
    } catch {
      console.error('Error updating StaffRole');
    }
  };

  if (loading) return <div>Loading StaffRole details...</div>;

  return (
    <StaffRoleForm defaultValues={defaultValues} isEditMode onSubmitHandler={onSubmitHandler} />
  );
};

export default EditStaffRolePage;
