"use client";

import avatar2 from "@/assets/images/users/avatar-2.jpg";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Image from "next/image";
import { Button, Card, CardBody, Col, Row } from "react-bootstrap";
import type { StaffType } from "@/types/data";
import { useRouter } from "next/navigation";

const languageMap: Record<string, string> = {
  "lang-001": "Dutch",
  "lang-002": "French",
};

const StaffDetails = ({ data }: { data: StaffType }) => {
  const router = useRouter();

  const handleEditClick = (id: any) => {
    router.push(`/staffs/staffs-form/${id}/edit`);
  };

  const handleEditPermissionClick = (id: any) => {
    router.push(`/staffs/staffs-form/${id}/permission`);
  };

  return (
    <Card>
      <CardBody>
        {/* Top Section with Avatar */}
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mt-3">
          <div className="d-flex align-items-center gap-3">
            <Image
              src={avatar2}
              alt="avatar"
              priority
              className="rounded-circle avatar-xl img-thumbnail"
            />
            <div>
              <h3 className="fw-semibold mb-1">{data?.name}</h3>
              <p className="link-primary fw-medium fs-14">
                {data?.dob || "DOB not provided"} | {data?.gender}
              </p>
            </div>
          </div>
          <div className="d-flex gap-1">
            <Button
              variant="dark"
              className="avatar-sm d-flex align-items-center justify-content-center fs-20"
              onClick={() => handleEditClick(data._id)}
            >
              <IconifyIcon icon="ri:edit-fill" />
            </Button>
            <Button
              variant="primary"
              className="avatar-sm d-flex align-items-center justify-content-center fs-20"
              onClick={() => handleEditPermissionClick(data._id)}
            >
              <IconifyIcon icon="ri:settings-3-fill" />
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <Row className="my-4">
          <Col lg={4}>
            <p className="text-dark fw-semibold fs-16 mb-1">E-mail Address :</p>
            <p className="mb-0">{data?.email}</p>
          </Col>
          <Col lg={4}>
            <p className="text-dark fw-semibold fs-16 mb-1">Numéro de téléphone :</p>
            <p className="mb-0">{data?.phoneNumber}</p>
          </Col>
          <Col lg={4}>
            <p className="text-dark fw-semibold fs-16 mb-1">Primary Branch :</p>
            <p className="mb-0">
              {data?.selectedBranchDetailed?.name || data?.selectedBranch}
            </p>
          </Col>
        </Row>

        {/* Address & Mode */}
        <Row className="my-4">
          <Col lg={8}>
            <p className="text-dark fw-semibold fs-16 mb-1">Address :</p>
            <p className="mb-0">
              {data?.address?.line1}{" "}
              {data?.address?.line2 ? `${data.address.line2}, ` : ""}
              {data?.address?.city}, {data?.address?.country} -{" "}
              {data?.address?.zip_code}
            </p>
          </Col>
          <Col lg={4}>
            <p className="text-dark fw-semibold fs-16 mb-1">
              Mode of Register :
            </p>
            <p className="mb-0">Online</p>
          </Col>
        </Row>

        {/* Additional Info */}
        <Row className="my-4">
          <Col lg={4}>
            <p className="text-dark fw-semibold fs-16 mb-1">Languages :</p>
            <p className="mb-0">
              {Array.isArray(data?.languages) && data.languages.length > 0
                ? data.languages.map((code) => languageMap[code] || code).join(", ")
                : "Not specified"}
            </p>
          </Col>
          <Col lg={4}>
            <p className="text-dark fw-semibold fs-16 mb-1">Role ID :</p>
            <p className="mb-0">{data?.roleId}</p>
          </Col>
          <Col lg={4}>
            <p className="text-dark fw-semibold fs-16 mb-1">Access Level :</p>
            <p className="mb-0">{data?.accessLevelId}</p>
          </Col>
        </Row>

        <Row className="my-4">
          <Col lg={6}>
            <p className="text-dark fw-semibold fs-16 mb-1">Branches :</p>
            {Array.isArray(data?.branches) && data.branches.length > 0 ? (
              <ul className="mb-0">
                {data.branches.map((b, i) => (
                  <li key={i}>
                    {b.id} {b.isPrimary && <strong>(Primary)</strong>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-0">Not assigned</p>
            )}
          </Col>
          <Col lg={6}>
            <p className="text-dark fw-semibold fs-16 mb-1">Experience :</p>
            <p className="mb-0">{data?.experience || "Not specified"}</p>
          </Col>
        </Row>

        <Row className="my-4">
          <Col lg={6}>
            <p className="text-dark fw-semibold fs-16 mb-1">Education :</p>
            <p className="mb-0">{data?.education || "Not specified"}</p>
          </Col>
          <Col lg={6}>
            <p className="text-dark fw-semibold fs-16 mb-1">
              Registration Number :
            </p>
            <p className="mb-0">
              {data?.registrationNumber || "Not specified"}
            </p>
          </Col>
        </Row>

        <Row className="my-4">
          <Col lg={6}>
            <p className="text-dark fw-semibold fs-16 mb-1">Certification Files :</p>
            {Array.isArray(data?.certificationFiles) &&
            data.certificationFiles.length > 0 ? (
              <ul className="mb-0">
                {data.certificationFiles.map((file, i) => (
                  <li key={i}>
                    {file.path}
                    {file.formattedSize ? ` (${file.formattedSize})` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-0">No files uploaded</p>
            )}
          </Col>
          <Col lg={6}>
            <p className="text-dark fw-semibold fs-16 mb-1">Availability :</p>
            {Array.isArray(data?.availability) && data.availability.length > 0 ? (
              <ul className="mb-0">
                {data.availability.map((slot, i) => (
                  <li key={i}>
                    {slot.day}: {slot.from} - {slot.to}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-0">Not provided</p>
            )}
          </Col>
        </Row>

        <Row className="my-4">
          <Col lg={12}>
            <p className="text-dark fw-semibold fs-16 mb-1">Permissions :</p>
            {Array.isArray(data?.permissions) && data.permissions.length > 0 ? (
              <ul className="mb-0">
                {data.permissions.map((perm, i) => (
                  <li key={i}>
                    {"_id" in perm ? `ID: ${perm._id}, ` : ""}
                    {"enabled" in perm ? `Enabled: ${perm.enabled}` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-0">No permissions assigned</p>
            )}
          </Col>
        </Row>

        {/* Description */}
        <Row className="my-4">
          <Col lg={12}>
            <p className="text-dark fw-semibold fs-16 mb-1">Description :</p>
            <p className="mb-0">{data?.description}</p>
          </Col>
        </Row>

        {/* Tags */}
        <Row>
          <Col lg={12}>
            <p className="text-dark fw-semibold fs-16 mb-1">Tags :</p>
            <div className="d-flex flex-wrap gap-2">
              {Array.isArray(data?.tags) &&
                data.tags.map((tag, i) => (
                  <p className="mb-0 d-flex align-items-center" key={i}>
                    <IconifyIcon
                      icon="ri:circle-fill"
                      className="fs-10 me-2 text-success"
                    />
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
