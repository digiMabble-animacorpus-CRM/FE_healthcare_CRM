"use client";

import { Card, CardBody, CardHeader, CardTitle, Col, Row } from "react-bootstrap";
import type { CustomerEnquiriesType } from "@/types/data";

interface Props {
  customerInfo: CustomerEnquiriesType;
}

const CustomerInfoCard = ({ customerInfo }: Props) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle as="h6">Customer Details</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col md={6}>
            <strong>Name:</strong> {customerInfo.name}
          </Col>
          <Col md={6}>
            <strong>Email:</strong> {customerInfo.email}
          </Col>
          <Col md={6} className="mt-2">
            <strong>Phone:</strong> {customerInfo.number}
          </Col>
          <Col md={6} className="mt-2">
            <strong>Gender:</strong> {customerInfo.gender}
          </Col>
          <Col md={6} className="mt-2">
            <strong>Preferred Language:</strong> {customerInfo.language}
          </Col>
          <Col md={6} className="mt-2">
            <strong>Branch:</strong> {customerInfo.branch}
          </Col>
          <Col md={6} className="mt-2">
            <strong>Date of Birth:</strong> {customerInfo.dob}
          </Col>
          <Col md={6} className="mt-2">
            <strong>City:</strong> {customerInfo.city}
          </Col>
          <Col md={6} className="mt-2">
            <strong>Country:</strong> {customerInfo.country}
          </Col>
          <Col md={6} className="mt-2">
            <strong>Zip Code:</strong> {customerInfo.zipCode}
          </Col>
          <Col md={12} className="mt-2">
            <strong>Address:</strong> {customerInfo.address}
          </Col>
          <Col md={12} className="mt-2">
            <strong>Tags:</strong> {customerInfo.tags.length ? customerInfo.tags.join(", ") : "-"}
          </Col>
          <Col md={12} className="mt-2">
            <strong>Description:</strong> {customerInfo.description || "-"}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default CustomerInfoCard;
