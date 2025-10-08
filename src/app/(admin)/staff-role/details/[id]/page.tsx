import PageTitle from '@/components/PageTitle';
import type { StaffRoleType } from '@/types/data';
import { Col, Row } from 'react-bootstrap';
import { Metadata } from 'next';
import StaffRoleDetail from './components/StaffRoleDetail';

export const metadata: Metadata = { title: 'Staff Role Overview' };

interface Props {
  params: { id: string };
}

const StaffRoleDetailsPage = async ({ params }: Props) => {
  const staffRoleId = params.id;

  // 👉 Dummy data instead of API
  const staffRoles: StaffRoleType[] = [
    {
      id: staffRoleId,
      role_name: 'Admin',
      role_description: 'Has full access to all modules.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

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
