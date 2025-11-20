'use client';

import PageTitle from '@/components/PageTitle';
import { getTherapistById } from '@/helpers/therapist';
import type { TherapistType } from '@/types/data';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Card, Spinner } from 'react-bootstrap';

const TherapistDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [therapist, setTherapist] = useState<TherapistType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTherapist = async () => {
      setLoading(true);
      try {
        const data = await getTherapistById(id as string);
        if (!data) throw new Error('Failed to fetch therapist');
        setTherapist(data);
      } catch (err) {
        console.error('❌ Error fetching therapist:', err);
        router.push('/therapists/therapist-list');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapist();
  }, [id, router]);

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading therapist details...</p>
      </div>
    );

  if (!therapist)
    return (
      <div className="text-center py-5 text-muted">
        <p>No therapist data found.</p>
      </div>
    );

  return (
    <>
      <Button
        className="mb-3"
        variant="text"
        size="sm"
        onClick={() => router.push('/therapists/therapist-list')}
      >
        ← Back to List
      </Button>

      <PageTitle subName="Thérapeute" title="Détails du thérapeute" />

      <Card className="shadow-sm border-0 mt-3">
        <Card.Body>
          <h4 className="mb-3">
            {therapist.firstName} {therapist.lastName}
          </h4>

          <div className="row">
            <div className="col-md-6 mb-3">
              <strong>ID:</strong> <br />
              <span>{therapist.id || 'N/A'}</span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>NIHII:</strong> <br />
              <span>{therapist.nihii || 'N/A'}</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default TherapistDetailsPage;
