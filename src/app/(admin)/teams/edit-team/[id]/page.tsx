import FileUpload from '@/components/FileUpload';
import PageTitle from '@/components/PageTitle';
import { Col, Row } from 'react-bootstrap';
import { Metadata } from 'next';
import AddTeam from '../../add-team/components/AddTeam';
// import { getTeamMember } from '@/helpers/team-members';

export const metadata: Metadata = { title: 'Customers Edit' };

// Next.js App Router lets us use async server components
const TeamEditPage = async ({ params }: { params: { id: string } }) => {
  // const teamMember = await getTeamMember(params.id);

  return (
    <>
      <PageTitle title="Edit Customer" subName="" />
      {/* <AddTeam defaultValues={teamMember} isEdit /> */}
    </>
  );
};

export default TeamEditPage;
