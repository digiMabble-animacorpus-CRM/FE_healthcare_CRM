'use client';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import type { PermissionType, StaffRoleType } from '@/types/data';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, Col, Row } from 'react-bootstrap';

const StaffRoleDetail = ({ data }: { data: StaffRoleType }) => {
  const router = useRouter();

  if (!data) {
    return <div>Loading...</div>; // Handle loading state or error
  }


  const handleEditClick = (id: string) => {
    router.push(`/staff-role/edit-staffRole/${id}`);
  };

  return (
    <Card>
      <CardBody>
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mt-3">
          <div className="d-flex align-items-center gap-3">
            <div>
              <h3 className="fw-semibold mb-1">{data?.label}</h3>
              <p className="link-primary fw-medium fs-14">{data?.tag}</p>
            </div>
          </div>
          <div className="d-flex gap-1">
            {/* <Button
              variant="dark"
              className="avatar-sm d-flex align-items-center justify-content-center fs-20"
              onClick={() => handleEditClick(data._id)}
            >
              <span>
                <IconifyIcon icon="ri:edit-fill" />
              </span>
            </Button> */}
          </div>
        </div>

        <Row className="my-4">
          <Col lg={4}>
            <p className="text-dark fw-semibold fs-16 mb-1">Key :</p>
            <p className="mb-0">{data.key}</p>
          </Col>
          <Col lg={3}>
            <p className="text-dark fw-semibold fs-16 mb-1">Is Internal :</p>
            <p className="mb-0">{data.internal ? 'Yes' : 'No'}</p>
          </Col>
          <Col lg={3}>
            <p className="text-dark fw-semibold fs-16 mb-1">Requires Details :</p>
            <p className="mb-0">{data.requiresDetails ? 'Yes' : 'No'}</p>
          </Col>
          <Col lg={2}>
            <p className="text-dark fw-semibold fs-16 mb-1">Requires Availability :</p>
            <p className="mb-0">{data.requiresAvailability ? 'Yes' : 'No'}</p>
          </Col>
        </Row>

        <Row className="my-4">
          <Col lg={12}>
            <p className="text-dark fw-semibold fs-16 mb-1">Description :</p>
            <p className="mb-0">{data.description}</p>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <p className="text-dark fw-semibold fs-16 mb-1">Permissions :</p>
            {Array.isArray(data?.defaultPermissionsDetailed) &&
            data.defaultPermissionsDetailed.length > 0 ? (
              <div className="d-flex gap-2 flex-wrap">
                {data.defaultPermissionsDetailed.map((perm: PermissionType, i: any) => (
                  <p className="mb-0 d-flex align-items-center" key={i}>
                    <IconifyIcon icon="ri:circle-fill" className="fs-10 me-2 text-success" />
                    {perm.label}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-muted">No permissions assigned.</p>
            )}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default StaffRoleDetail;
