'use client';

import avatar2 from '@/assets/images/users/avatar-2.jpg';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Image from 'next/image';
import { Button, Card, CardBody, CardTitle, Col, Row } from 'react-bootstrap';
import type { StaffType } from '@/types/data';
import { useRouter } from 'next/navigation';
import { encryptAES, decryptAES } from '@/utils/encryption';
import { useParams } from 'next/navigation';
import { string } from 'yup';

// const StaffDetails = ({ data }: { data: StaffType }) => {
const StaffDetails = ({ data }: { data: StaffType }) => {
  const router = useRouter();
  // const params = useParams();
  // const encryptedId = params?.id as string;

  console.log(' Staff Details Data:', data);
  console.log(' Raw Staff ID:', data?.id);

  const handleEditClick = (id: string) => {
    console.log('🧪 handleEditClick triggered with id:', id);

    if (!id) {
      console.error(' Staff ID is missing or undefined in handleEditClick');
      return;
    }

    try {
      const encryptedId = encryptAES(id);
      const encodedId = encodeURIComponent(encryptedId);

      //  Save the data to sessionStorage
      sessionStorage.setItem('selectedStaff', JSON.stringify(data));

      console.log(' Navigating to:', `/staffs/staffs-form/${encodedId}/edit`);
      router.push(`/staffs/staffs-form/${encodedId}/edit`);
    } catch (error) {
      console.error(' Error during ID encryption or navigation:', error);
    }
  };

  const handleEditPermissionClick = (id: string) => {
    const encryptedId = encodeURIComponent(encryptAES(id));
    router.push(`/staffs/staffs-form/${encryptedId}/permission`);
  };

  return (
    <Card>
      <CardBody>
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mt-3">
          <div className="d-flex align-items-center gap-3">
            <Image
              src={avatar2}
              alt="avatar"
              priority
              className="rounded-circle avatar-xl img-thumbnail"
            />
            <div>
              {/* <h3 className="fw-semibold mb-1">{data.name}</h3> */}
              <h3 className="fw-semibold mb-1">{data.staff_name}</h3>

              <p className="link-primary fw-medium fs-14">
                {data?.dob} | {data?.gender}
              </p>
            </div>
          </div>
          <div className="d-flex gap-1">
            <Button
              variant="dark"
              className="avatar-sm d-flex align-items-center justify-content-center fs-20"
              // onClick={() =>  handleEditClick(data.id)}
              onClick={() => handleEditClick(String(data.id))}
            >
              <span>
                {' '}
                <IconifyIcon icon="ri:edit-fill" />
              </span>
            </Button>
            {/* <Button
              variant="primary"
              className="avatar-sm d-flex align-items-center justify-content-center fs-20"
            >
              <span>
                {" "}
                <IconifyIcon icon="ri:share-fill" />
              </span>
            </Button> */}
          </div>
        </div>
        <Row className="my-4">
          <Col lg={4}>
            <p className="text-dark fw-semibold fs-16 mb-1">Email Address :</p>
            <p className="mb-0">{data?.email}</p>
          </Col>
          <Col lg={3}>
            <p className="text-dark fw-semibold fs-16 mb-1">Phone Number :</p>
            <p className="mb-0">{data?.phoneNumber}</p>
          </Col>
          <Col lg={3}>
            <p className="text-dark fw-semibold fs-16 mb-1">Primary Branch :</p>
            <p className="mb-0">{data?.selectedBranchDetailed?.name} </p>
          </Col>
          <Col lg={2}>
            <p className="text-dark fw-semibold fs-16 mb-1">Status :</p>
            <span
              className={`badge bg-${
                data?.status === 'active' ? 'success' : 'danger'
              } text-white fs-12 px-2 py-1`}
            >
              {data?.status}
            </span>
          </Col>
        </Row>
        <Row className="my-4">
          <Col lg={8}>
            <p className="text-dark fw-semibold fs-16 mb-1">Address :</p>
            <p className="mb-0">
              {data.address?.street} {data.address?.line2}, {data.address?.city},{' '}
              {data.address?.country} - {data.address?.zip_code}
            </p>
          </Col>
          <Col lg={4}>
            <p className="text-dark fw-semibold fs-16 mb-1">Mode of Register :</p>
            <p className="mb-0">Online</p>
          </Col>
        </Row>
        <Row className="my-4">
          <Col lg={12}>
            <p className="text-dark fw-semibold fs-16 mb-1">Description :</p>
            <p className="mb-0">{data?.description}</p>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <p className="text-dark fw-semibold fs-16 mb-1">Tags :</p>
            <div className="d-flex flex-wrap gap-2">
              {Array.isArray(data?.tags) &&
                data.tags.map((tag: string, i: number) => (
                  <p className="mb-0 d-flex align-items-center" key={i}>
                    <IconifyIcon icon="ri:circle-fill" className="fs-10 me-2 text-success" />
                    {tag}
                  </p>
                ))}
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default StaffDetails;
