import React from 'react';
import PageTitle from '@/components/PageTitle';
import AddTeamPage from '../../add-team/components/AddTeam';
import { getAllTeamMembers } from '@/helpers/team-members';

const TeamEditPage = async ({ params }: { params: { id: string } }) => {
  const id = Number(params.id);
  const response = await getAllTeamMembers(id);
  const teamMember = response?.data?.[0] ?? null;

  return (
    <>
      <PageTitle title="Edit Team Member" subName="" />
      <AddTeamPage defaultValues={teamMember} isEdit />
    </>
  );
};

export default EditTeam;
