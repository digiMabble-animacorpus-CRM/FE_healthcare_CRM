'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TherapistDetails from './components/TeamDetails';
import { getTherapistById } from '@/helpers/therapist';
import type { TeamMemberType, TherapistType } from '@/types/data';
import { getTeamMemberById } from '@/helpers/team-members';
import TeamDetails from './components/TeamDetails';
import { paymentsresellersubscription } from 'googleapis/build/src/apis/paymentsresellersubscription';

const TeamDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<TeamMemberType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTeamMembers = async () => {
      setLoading(true);
      try {
        const teams = await getTeamMemberById(id);
        if (!teams) throw new Error('Failed to fetch teams');
        setData(teams);
      } catch (error) {
        console.error(error);
        alert('Failed to load teams details');
        router.push('/teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [id, router]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No teams found.</p>;

  return (
    <TeamDetails
      first_name={data.first_name}
      last_name={data.last_name}
      full_name={data.full_name}
      job_1={data.job_1}
      job_2={data.job_2}
      job_3={data.job_3}
      job_4={data.job_4}
      specific_audience={data.specific_audience}
      specializations={data.specializations}
      who_am_i={data.who_am_i}
      consultations={data.consultations}
      office_address={data.office_address}
      contact_email={data.contact_email}
      contact_phone={data.contact_phone}
      schedule={data.schedule}
      about={data.about}
      languages_spoken={data.languages_spoken}
      payment_methods={data.payment_methods}
      diplomas_and_training={data.diplomas_and_training}
      website={data.website}
      frequently_asked_questions={data.frequently_asked_questions}
      calendar_links={data.calendar_links}
      photo={data.photo}
    />
  );
};

export default TeamDetailsPage;
