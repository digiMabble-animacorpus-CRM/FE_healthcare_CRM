import PageTitle from "@/components/PageTitle";
import { getAllProperty } from "@/helpers/data";
import type { StaffType } from "@/types/data";
import { Col, Row } from "react-bootstrap";
import { Metadata } from "next";
import StaffDetails from "./components/StaffDetails";
import { getStaffById } from "@/helpers/staff";
import WeeklyInquiry from "@/app/(admin)/therapists/details/[id]/components/WeeklyInquiry";

export const metadata: Metadata = { title: "Staff Overview" };

interface Props {
  params: { id: string };
}

const StaffDetailPage = async ({ params }: Props) => {
  const staffId = params.id;
  const propertyData = await getAllProperty();
  const response = await getStaffById(staffId);

  if (!response || !response.data || response.data.length === 0) {
    return (
        <p>No staff found.</p>
    );
  }

  const staffs: StaffType[] = response.data;

  return (
    <>
      <PageTitle subName="Staffs" title="Staff Overview" />
      <Row>
        <Col xl={8} lg={12}>
          <StaffDetails data={staffs[0]} />
        </Col>
        <Col xl={4} lg={12}>
          <WeeklyInquiry />
        </Col>
      </Row>
    </>
  );
};

export default StaffDetailPage;
