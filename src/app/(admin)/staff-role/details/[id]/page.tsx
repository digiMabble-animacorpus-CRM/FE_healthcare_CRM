import PageTitle from '@/components/PageTitle';
import type { StaffRoleType } from '@/types/data';
import { Col, Row } from 'react-bootstrap';
import { Metadata } from 'next';
import { getStaffRoleById } from '@/helpers/staff';
import StaffRoleDetail from './components/StaffRoleDetail';

export const metadata: Metadata = { title: 'Staff Role Overview' };

interface Props {
  params: { id: string };
}

const StaffRoleDetailsPage = async ({ params }: Props) => {
  const staffRoleId = params.id;
  const response = await getStaffRoleById(staffRoleId);
  const staffRoles: StaffRoleType[] = response.data;

  return (
    <>
      <PageTitle subName="Staff Roles" title="Staff Role Overview" />
      <Row>
        <Col xl={12} lg={12}>
          <StaffRoleDetail data={staffRoles[0]} />
        </Col>
      </Row>
    </>
  );
};

export default StaffRoleDetailsPage;
