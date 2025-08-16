'use client';

import { API_BASE_PATH } from '@/context/constants';
import { encryptAES } from '@/utils/encryption';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import type { StaffType } from '@/types/data';
import StaffForm from '../staffForm';

const CreateStaffPage = () => {
  const router = useRouter();

  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

  const handleCreate = async (formData: StaffType) => {
    console.log('handleCreate triggered with:', formData);

    if (!formData.address) {
      toast.error('Address is required.');
      return;
    }

    if (!formData.accessLevelId && !formData.accessLevel) {
      toast.error('Access level is required.');
      return;
    }

    const formattedPermissions = formData.permissions
      .filter((p) => p.enabled) // Only send enabled permissions
      .map((p) => {
        // Step 1: Convert _id like "view-patients" to "read:patients"
        let formattedId = p._id.replace('-', ':');

        // Step 2: Map frontend-friendly verbs to backend-standard actions
        if (formattedId.startsWith('view:')) {
          formattedId = formattedId.replace('view:', 'read:');
        } else if (formattedId.startsWith('edit:')) {
          formattedId = formattedId.replace('edit:', 'update:');
        } else if (formattedId.startsWith('delete:')) {
          formattedId = formattedId.replace('delete:', 'remove:');
        }

        // Step 3: Extract action and resource
        const [action, resource] = formattedId.split(':');

        return {
          action,
          resource,
          enabled: true, //  Required by backend DTO
        };
      });

    const payload = {
      name: formData.name,
      email: formData.email,
      phone_number: formData.phoneNumber,
      gender: formData.gender,
      dob: formData.dob,
      description: formData.description,
      role_id: formData.roleId ? parseInt(formData.roleId.replace(/\D/g, '')) : undefined,
      access_level:
        formData.accessLevelId === 'al-001'
          ? 'staff'
          : formData.accessLevelId === 'al-002'
            ? 'branch-admin'
            : formData.accessLevelId === 'al-003'
              ? 'super-admin'
              : undefined,
      branches: formData.branches.map((b) =>
        typeof b === 'number' ? b : parseInt(b.id?.replace(/\D/g, '')),
      ),
      selected_branch: formData.selectedBranch
        ? parseInt(formData.selectedBranch.replace(/\D/g, ''))
        : undefined,
      address: {
        street: formData.address.street,
        city: formData.address.city,
        zip_code: formData.address.zip_code,
        country: formData.address.country,
      },
      languages: formData.languages,
      availability: formData.availability || [],
      permissions: formattedPermissions,

      created_by: Number(userId),
      login_details: {
        otpVerified: false,
      },
      status: 'active',
    };

    console.log('Payload before encryption:', payload);

    try {
      const encrypted = encryptAES(payload);
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${API_BASE_PATH}/staff`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: encrypted }),
      });

      const result = await response.json();
      console.log('Response from server:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Unknown error');
      }

      toast.success('Staff created successfully!');
      //router.push("/staffs"); //  uncomment when needed
    } catch (error: any) {
      console.error('Create Staff Error:', error);
      toast.error(error.message || 'Failed to create staff.');
    }
  };

  return <StaffForm onSubmitHandler={handleCreate} />;
};

export default CreateStaffPage;
