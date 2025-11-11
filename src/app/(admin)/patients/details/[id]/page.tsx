'use client';

import PageTitle from '@/components/PageTitle';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPatientById, getPatientEvents, updateEventNote } from '@/helpers/patient';
import type { PatientType } from '@/types/data';
import { Button, Card, Spinner, Table, Pagination, Modal, Form } from 'react-bootstrap';
import dayjs from 'dayjs';

const calculateAge = (birthdate: { year: number; month: number; day: number }) => {
  if (!birthdate || !birthdate.year) return null;
  const now = dayjs();
  const birth = dayjs(`${birthdate.year}-${birthdate.month}-${birthdate.day > 0 ? birthdate.day : 1}`);
  return now.diff(birth, 'year');
};

const PatientDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [patient, setPatient] = useState<PatientType | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Events state
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // ✅ Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  // ✅ Fetch patient details
  useEffect(() => {
    if (!id) return;

    const fetchPatient = async () => {
      setLoading(true);
      try {
        const data = await getPatientById(id);
        if (!data) throw new Error('Failed to fetch patient');
        setPatient(data);
      } catch (err) {
        console.error('❌ Error fetching patient:', err);
        router.push('/patients/patient-list');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, router]);

  // ✅ Fetch events
  const fetchEvents = async () => {
    if (!id) return;
    setEventsLoading(true);
    const result = await getPatientEvents(id as string, currentPage, limit);
    setEvents(result.elements || []);
    setTotalCount(result.totalCount || 0);
    setEventsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [id, currentPage]);

  // ✅ Modal handlers
  const handleOpenNoteModal = (event: any) => {
    setSelectedEvent(event);
    setNoteText(event.hpNote || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setNoteText('');
  };

  const handleSaveNote = async () => {
    if (!selectedEvent) return;
    setSaving(true);
    const success = await updateEventNote(selectedEvent.id, noteText);
    setSaving(false);

    if (success) {
      handleCloseModal();
      await fetchEvents();
    } else {
      alert('Failed to save note. Please try again.');
    }
  };

  // ✅ Loading states
  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading patient details...</p>
      </div>
    );

  if (!patient)
    return (
      <div className="text-center py-5 text-muted">
        <p>No patient data found.</p>
      </div>
    );

  const email = patient.contactInfos?.find((c) => c.type === 'EMAIL')?.value || 'N/A';
  const phone = patient.contactInfos?.find((c) => c.type === 'PHONE')?.value || 'N/A';
  const address = patient.address || {};

  return (
    <>
      <Button className="mb-3" variant="text" size="sm" onClick={() => router.push('/patients/patient-list')}>
        ← Back to List
      </Button>

      <PageTitle subName="Patient" title="Détails du patient" />

      {/* ✅ Patient Info */}
      <Card className="shadow-sm border-0 mt-3">
        <Card.Body>
          <h4 className="mb-3">
            {patient.firstName} {patient.lastName}
          </h4>

          <div className="row">
            <div className="col-md-6 mb-3">
              <strong>External ID:</strong> <br />
              <span>{patient.externalId || 'N/A'}</span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>SSIN:</strong> <br />
              <span>{patient.ssin || 'N/A'}</span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Gender:</strong> <br />
              <span>{patient.legalGender || 'N/A'}</span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Language:</strong> <br />
              <span>{patient.language || 'N/A'}</span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Birthdate:</strong> <br />
              <span>
                {patient.birthdate
                  ? `${patient.birthdate.day}/${patient.birthdate.month}/${patient.birthdate.year}`
                  : 'N/A'}
                {patient.birthdate && <> ({calculateAge(patient.birthdate)} yrs)</>}
              </span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Status:</strong> <br />
              <span className={`badge bg-${patient.status === 'ACTIVE' ? 'success' : 'secondary'} text-white`}>
                {patient.status || 'N/A'}
              </span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Email:</strong> <br />
              <span>{email}</span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Phone:</strong> <br />
              <span>{phone}</span>
            </div>

            <div className="col-md-12 mb-3">
              <strong>Address:</strong> <br />
              {address.street ? (
                <span>
                  {address.street} {address.number && `, ${address.number}`}
                  <br />
                  {address.zipCode && `${address.zipCode} `}
                  {address.city && `${address.city}, `}
                  {address.country || ''}
                </span>
              ) : (
                <span>N/A</span>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* ✅ Appointments Table */}
      <Card className="shadow-sm border-0 mt-4">
        <Card.Body>
          <h5 className="mb-3">Appointments</h5>

          {eventsLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading appointments...</p>
            </div>
          ) : events.length === 0 ? (
            <p className="text-muted text-center py-3">No appointments found.</p>
          ) : (
            <>
              <Table hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Pattern</th>
                    <th>Status</th>
                    <th>Calendar</th>
                    <th>Note</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>{dayjs(event.startAt).format('DD/MM/YYYY HH:mm')}</td>
                      <td>{event.motiveLabel || '—'}</td>
                      <td>
                        <span
                          className={`badge bg-${event.status === 'CANCELED'
                            ? 'danger'
                            : event.status === 'ACTIVE'
                              ? 'success'
                              : 'secondary'
                            } text-white`}
                        >
                          {event.status || 'No status'}
                        </span>
                      </td>
                      <td>{event.calendarLabel || '—'}</td>

                      {/* ✅ Note column */}
                      <td style={{ whiteSpace: 'pre-wrap' }}>
                        {event.hpNote ? (
                          <span>{event.hpNote}</span>
                        ) : (
                          <span className="text-muted">No note</span>
                        )}
                      </td>

                      {/* ✅ Action column */}
                      <td className="text-center">
                        <Button
                          variant="link"
                          size="sm"
                          className={`p-0 ${event.hpNote ? 'text-primary' : 'text-success'}`}
                          onClick={() => handleOpenNoteModal(event)}
                        >
                          {event.hpNote ? 'Edit Note' : 'Add Note'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>


              {totalCount > limit && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    {Array.from({ length: Math.ceil(totalCount / limit) }, (_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={i + 1 === currentPage}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* ✅ Add Note Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedEvent?.motiveLabel || 'Add Note'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1">
            <strong>{selectedEvent?.calendarLabel}</strong>
          </p>
          <p className="text-muted mb-3">
            {selectedEvent ? dayjs(selectedEvent.startAt).format('MMM D - h:mm A') : ''}
          </p>

          <Form.Group controlId="hpNote">
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Add a note"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSaveNote} disabled={saving}>
            {saving ? 'Saving...' : 'To safeguard'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PatientDetailsPage;
