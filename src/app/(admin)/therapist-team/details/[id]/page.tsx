'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TeamDetails from './components/TeamDetails';
import { getTeamMemberById } from '@/helpers/team-members';
import type { TeamMemberType } from '@/types/data';

const TeamDetailsPage = () => {
  const { id } = useParams(); // this will be a string like "2"
  const router = useRouter();
  const [data, setData] = useState<TeamMemberType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTeamMember = async () => {
      setLoading(true);
      try {
        // Convert id to number for the temporary patch
        const numericId = Number(id);
        const team = await getTeamMemberById(numericId);
        setData(team);
      } catch (error) {
        console.error(error);
        alert('Failed to load team member details');
        router.push('/teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMember();
  }, [id, router]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No team member found.</p>;

  return (
    <TeamDetails
      first_name={data.firstName}
      last_name={data.lastName}
      full_name={data.fullName}
      job_1={data.job_1}
      job_2={data.job_2}
      job_3={data.job_3}
      job_4={data.job_4}
      specific_audience={data.specific_audience}
      specialization_1={data.specializationIds?.[0] ? String(data.specializationIds[0]) : '-'}
      specializations={data.specializationIds?.map(String) || []}
      who_am_i={data.aboutMe}
      consultations={data.consultations}
      office_address={data.office_address}
      contact_email={data.contactEmail}
      contact_phone={data.contactPhone}
      schedule={data.availability || {}}
      about={data.aboutMe}
      languages_spoken={data.languagesSpoken || []}
      payment_methods={data.payment_methods || []}
      diplomas_and_training={data.degreesTraining ? [data.degreesTraining] : []}
      website={data.website}
      frequently_asked_questions={data.faq || []}
      calendar_links={data.calendar_links || []}
      photo={data.imageUrl}
      branches={data.branches || []}
      primary_branch_id={data.primary_branch_id || 0}
      role={data.role}
      status={data.status}
    />
  );
};

export default TeamDetailsPage;
