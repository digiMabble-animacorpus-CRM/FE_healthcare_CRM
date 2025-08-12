'use client';

import PageTitle from "@/components/PageTitle";
import { getStaffById } from "@/helpers/staff";
import { useEffect, useState } from "react";
import { Col, Row, Spinner, Alert } from "react-bootstrap";
import WeeklyInquiry from "./components/WeeklyInquiry";
import TransactionHistory from "./components/TransactionHistory";
import StaffDetails from "./components/StaffDetails";
import type { StaffType } from "@/types/data";

interface Props {
  params: { id: string };
}

const StaffDetailPage = ({ params }: Props) => {
  const [staff, setStaff] = useState<StaffType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const encryptedId = decodeURIComponent(params.id);
        console.log(" Fetching staff with Encrypted ID:", encryptedId);

        const response = await getStaffById(encryptedId);
        console.log(" API Response:", response);

        //  If response is the staff data directly:
        if (!response || typeof response !== 'object' || !('id' in response)) {
          throw new Error("Invalid staff data received from server");
        }

        setStaff(response);
      } catch (err: any) {
        console.error(" Error fetching staff:", err.message || err);
        setError("Failed to load staff data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [params.id]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" /> Loading staff details...
      </div>
    );
  }

  // if (error || !staff) {
  //   return (
  //     <div className="text-center mt-5">
  //       <Alert variant="danger">
  //         {error || "Staff not found."}
  //       </Alert>
  //     </div>
  //   );
  // }
if (!staff) {
  return (
    <div className="text-center mt-5">
      <Alert variant="danger">{error || "Staff not found or failed to load."}</Alert>
    </div>
  );
}
  return (
    <>
      <PageTitle subName="Staffs" title="Staff Overview" />
      <Row>
        <Col xl={8} lg={12}>
          <StaffDetails data={staff} />
        </Col>
        <Col xl={4} lg={12}>
          <WeeklyInquiry />
        </Col>
      </Row>
      <TransactionHistory />
    </>
  );
};

export default StaffDetailPage;
