'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import BranchForm, { BranchFormValues } from '../../branchForm';
import { API_BASE_PATH } from '@/context/constants';
import { Spinner } from 'react-bootstrap';
import axios from 'axios';

interface Props {
  params: { id?: string };
}

const EditBranchPage = ({ params }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<
    Partial<BranchFormValues & { branch_id?: string }>
  >({});

  useEffect(() => {
    if (!params.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No access token found');

        const res = await axios.get(`${API_BASE_PATH}/branches/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const branch = res.data;

        if (branch?.branch_id) {
          setDefaultValues({
            branch_id: branch.branch_id, // pass to BranchForm so it knows it's edit
            name: branch.name || '',
            phone: branch.phone || '',
            email: branch.email || '',
            address: branch.address || '',
            location: branch.location || '',
          });
        }
      } catch (err) {
        console.log(err);
        toast.error('Failed to load branch details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" role="status" className="me-2" />
        <span>Loading branch details...</span>
      </div>
    );
  }

  return <BranchForm defaultValues={defaultValues} isEditMode />;
};

export default EditBranchPage;
