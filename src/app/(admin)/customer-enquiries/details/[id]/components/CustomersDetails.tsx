"use client";

import avatar2 from "@/assets/images/users/avatar-2.jpg";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Image from "next/image";
import { Button, Card, CardBody, Col, Row } from "react-bootstrap";
import type { CustomerEnquiriesType } from "@/types/data";
import { useRouter } from "next/navigation";
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode, Key } from "react";

interface CustomersDetailsProps {
  data: CustomerEnquiriesType;
}

const CustomersDetails: React.FC<CustomersDetailsProps> = ({ data }) => {
  const router = useRouter();

  const handleEditClick = (id: string) => {
    router.push(`/customer-enquiries/edit-enquiry/${id}`);
  };

  const calculateAge = (dobStr: string): number | null => {
    if (!dobStr) return null;
    const dob = new Date(dobStr);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  console.log('CustomerDetails data:', data);

  return (
    <Card>
      <CardBody>
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mt-3">
          <div className="d-flex align-items-center gap-3">
            <Image
              src={avatar2}
              alt={`${data.name || "Customer"} avatar`}
              priority
              className="rounded-circle avatar-xl img-thumbnail"
            />
            <div>
              <h3 className="fw-semibold mb-1">{data.name || "N/A"}</h3>
              <p className="link-primary fw-medium fs-14">
                {data.dob} | {data.gender} | {calculateAge(data.dob)} years
              </p>
            </div>
          </div>
          <div className="d-flex gap-1">
            <Button
              variant="dark"
              className="avatar-sm d-flex align-items-center justify-content-center fs-20"
              onClick={() => handleEditClick(data._id)}
            >
              <span>
                <IconifyIcon icon="ri:edit-fill" />
              </span>
            </Button>
          </div>
        </div>

        <Row className="my-4">
          <Col lg={4}>
            <p className="text-dark fw-semibold fs-16 mb-1">Email Address :</p>
            <p className="mb-0">{data.email || "N/A"}</p>
          </Col>
          <Col lg={3}>
            <p className="text-dark fw-semibold fs-16 mb-1">Phone Number :</p>
            <p className="mb-0">{data.number || "N/A"}</p>
          </Col>
          <Col lg={3}>
            <p className="text-dark fw-semibold fs-16 mb-1">Branch :</p>
            <p className="mb-0">{data.branch || "N/A"}</p>
          </Col>
          <Col lg={2}>
            <p className="text-dark fw-semibold fs-16 mb-1">Status :</p>
            <span
              className={`badge bg-${
                data.status === "new" ? "success" : "danger"
              } text-white fs-12 px-2 py-1`}
            >
              {data.status || "N/A"}
            </span>
          </Col>
        </Row>

        <Row className="my-4">
          <Col lg={9}>
            <p className="text-dark fw-semibold fs-16 mb-1">Address :</p>
            <p className="mb-0">{data.address || "N/A"}</p>
          </Col>
          <Col lg={3}>
            <p className="text-dark fw-semibold fs-16 mb-1">Mode of Register :</p>
            <p className="mb-0">{data.modeOfRegister || "N/A"}</p>
          </Col>
        </Row>

        <Row className="my-4">
          <Col lg={12}>
            <p className="text-dark fw-semibold fs-16 mb-1">Description :</p>
            <p className="mb-0">{data.description || "N/A"}</p>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <p className="text-dark fw-semibold fs-16 mb-1">Tags :</p>
            <div className="d-flex gap-2 flex-wrap">
              {Array.isArray(data?.tags) && data.tags.length > 0 ? (
                data.tags.map((tag, i) => (
                  <p className="mb-0 d-flex align-items-center" key={i}>
                    <IconifyIcon
                      icon="ri:circle-fill"
                      className="fs-10 me-2 text-success"
                    />
                    {tag}
                  </p>
                ))
              ) : (
                <p className="mb-0 text-muted">No tags available</p>
              )}
            </div>
          </Col>
        </Row>

        {/* Family Details Section */}
        {data.familyDetails && data.familyDetails.length > 0 && (
          <Row className="my-4">
            <Col lg={12}>
              <p className="text-dark fw-semibold fs-16 mb-2">Family Details:</p>
              <ul className="list-unstyled">
                {data.familyDetails.map((member: { name: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; relation: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; age: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; }, idx: Key | null | undefined) => (
                  <li key={idx} className="mb-1">
                    <strong>{member.name}</strong> ({member.relation}) - {member.age} years
                  </li>
                ))}
              </ul>
            </Col>
          </Row>
        )}

        {/* Appointment Details Section */}
        {data.appointmentDetails && (
          <Row className="my-4">
            <Col lg={12}>
              <p className="text-dark fw-semibold fs-16 mb-2">Appointment Details:</p>
              <p className="mb-1"><strong>Date:</strong> {data.appointmentDetails.date}</p>
              {data.appointmentDetails.time && (
                <p className="mb-1"><strong>Time:</strong> {data.appointmentDetails.time}</p>
              )}
              <p className="mb-1"><strong>Purpose:</strong> {data.appointmentDetails.purpose}</p>
              <p className="mb-0"><strong>Status:</strong> {data.appointmentDetails.status}</p>
            </Col>
          </Row>
        )}
      </CardBody>
    </Card>
  );
};

export default CustomersDetails;
