'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TeamDetails from './components/TherapistTeamDetails';
import type { TherapistTeamMember } from '@/types/data';
import { getTherapistTeamMemberById } from '@/helpers/therapistTeam';

const TherapistTeamDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<TherapistTeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTeamMember = async () => {
      setLoading(true);
      try {
        const numericId = Number(id);
        const team = await getTherapistTeamMemberById(numericId);
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

  return <TeamDetails {...data} therapistTeamId={data.therapistId ?? data.id} />;

};

export default TherapistTeamDetailsPage;
