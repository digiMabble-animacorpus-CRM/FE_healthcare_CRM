'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import type { StaffType } from '@/types/data';
import { Button, Card, CardBody, CardHeader, CardTitle, Spinner, Row, Col } from 'react-bootstrap';
import PermissionsSection from '../../components/permissionSection';
import { getStaffById } from '@/helpers/staff';

const PermissionPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [staffInfo, setStaffInfo] = useState<StaffType | null>(null);

  /* form ---------------------------------------------------------------- */
  const methods = useForm<Pick<StaffType, 'permissions' | 'roleId'>>({
    defaultValues: {
      permissions: [],
      roleId: '',
    },
  });

  const { handleSubmit, setValue } = methods;

  /* fetch staff ---------------------------------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getStaffById(id);
        const data = response?.data?.[0];

        if (data) {
          setStaffInfo(data);

          /* load permissions but force them DISABLED */
          setValue(
            'permissions',
            (data.permissions || []).map((p: any) => ({
              _id: p._id,
              enabled: false,
            })),
          );

          /* make sure roleId exists in the form */
          setValue('roleId', data.roleId || '');
        } else {
          toast.error('Staff not found.');
        }
      } catch (error) {
        toast.error('Failed to fetch staff data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, setValue]);

  /* submit -------------------------------------------------------------- */
  const onSubmit = async (data: Pick<StaffType, 'permissions'>) => {
    try {
      // await updateStaffPermissions(id, data.permissions);
      toast.success('Permissions updated successfully!');
      // router.push("/staffs");
    } catch (error) {
      console.error(error);
      toast.error('Failed to update permissions.');
    }
  };

  /* loading spinner ----------------------------------------------------- */
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading staff data...</p>
      </div>
    );
  }

  /* render -------------------------------------------------------------- */
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* staff info card */}
        {staffInfo && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h6">Staff Details</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={6}>
                  <strong>Name:</strong> {staffInfo.name}
                </Col>
                <Col md={6}>
                  <strong>Email:</strong> {staffInfo.email}
                </Col>
                <Col md={6} className="mt-2">
                  <strong>Phone:</strong> {staffInfo.phoneNumber}
                </Col>
                <Col md={6} className="mt-2">
                  <strong>Gender:</strong> {staffInfo.gender}
                </Col>
                <Col md={6} className="mt-2">
                  <strong>Role:</strong> {staffInfo.role}
                </Col>
                <Col md={6} className="mt-2">
                  <strong>Access Level:</strong> {staffInfo.accessLevel}
                </Col>
                <Col md={6} className="mt-2">
                  <strong>Primary Branch:</strong> {staffInfo.selectedBranch}
                </Col>
                <Col md={6} className="mt-2">
                  <strong>Date of Birth:</strong> {staffInfo.dob}
                </Col>
                <Col md={12} className="mt-2">
                  <strong>Description:</strong> {staffInfo.description || '-'}
                </Col>
              </Row>
            </CardBody>
          </Card>
        )}

        {/* permissions form */}
        <Card>
          <CardHeader>
            <CardTitle as="h5">Modify Staff Permissions</CardTitle>
          </CardHeader>
          <CardBody>
            <PermissionsSection />
            <div className="mt-4 d-flex gap-3 justify-content-end">
              <Button type="submit" variant="primary">
                Update
              </Button>
              <Button variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </FormProvider>
  );
};

export default PermissionPage;
