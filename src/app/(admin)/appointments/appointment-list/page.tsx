'use client';

import PageTitle from '@/components/PageTitle';
import { useEffect, useRef, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Button, Col, Row, Spinner, Form, Dropdown, ButtonGroup, Modal, Card, CardHeader, CardTitle } from 'react-bootstrap';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import { Icon } from '@iconify/react';
import dynamic from 'next/dynamic';

const Calendar = dynamic(() => import('@toast-ui/react-calendar'), { ssr: false });

// MUI
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { useRouter } from 'next/navigation';

const BRANCHES = ['Gembloux - Orneau', 'Gembloux - Tout Vent', 'Anima Corpus Namur'];

const CATEGORIES = [
  { id: 'consultation', name: 'Consultation', color: '#007bff' },
  { id: 'followup', name: 'Follow-up', color: '#28a745' },
  { id: 'therapy', name: 'Therapy', color: '#ffc107' },
  { id: 'surgery', name: 'Surgery', color: '#dc3545' },
];

const AppointmentCalendarPage = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([...BRANCHES]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    CATEGORIES.map((c) => c.id),
  );
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [calendarViewMode, setCalendarViewMode] = useState<'calendar' | 'list'>('calendar');
  const [calendarHeight, setCalendarHeight] = useState('750px');

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const calendarRef = useRef<any>(null);
  const router = useRouter();


  const dummyAppointments = [
    {
      id: '1',
      calendarId: 'consultation',
      title: '🩺 Consultation with John Doe',
      category: 'time',
      start: dayjs().hour(8).minute(0).toISOString(),
      end: dayjs().hour(9).minute(0).toISOString(),
      branch: 'Gembloux - Orneau',
      raw: {
        status: 'confirmed',
        location: 'Room 101',
        participants: ['John Doe', 'Jane Smith'],
        notes: 'Discuss lab results and next steps.',
        icon: '🩺',
      },
    },
    {
      id: '2',
      calendarId: 'therapy',
      title: '💆 Physiotherapy Workshop',
      category: 'allday',
      start: dayjs().toISOString(),
      end: dayjs().add(1, 'day').toISOString(),
      branch: 'Anima Corpus Namur',
      raw: {
        status: 'pending',
        location: 'Therapy Hall A',
        participants: ['Trainer Alex', 'Group A'],
        notes: 'Bring yoga mats.',
        icon: '💆',
      },
    },
    {
      id: '3',
      calendarId: 'meeting',
      title: '📊 Weekly Staff Meeting',
      category: 'time',
      start: dayjs().hour(10).minute(30).toISOString(),
      end: dayjs().hour(11).minute(30).toISOString(),
      branch: 'Gembloux - Orneau',
      raw: {
        status: 'confirmed',
        location: 'Conference Room B',
        participants: ['Dr. Lee', 'Admin Team'],
        notes: 'Review KPIs and schedules.',
        icon: '📊',
      },
    },
    {
      id: '4',
      calendarId: 'surgery',
      title: '🔪 Knee Surgery - Mr. Wilson',
      category: 'time',
      start: dayjs().hour(14).minute(0).toISOString(),
      end: dayjs().hour(16).minute(0).toISOString(),
      branch: 'Anima Corpus Namur',
      raw: {
        status: 'confirmed',
        location: 'OR-2',
        participants: ['Dr. Patel', 'Nurse Amy'],
        notes: 'Patient must fast for 12 hours.',
        icon: '🔪',
      },
    },
    {
      id: '5',
      calendarId: 'consultation',
      title: '👩‍⚕️ Dermatology Checkup',
      category: 'time',
      start: dayjs().add(1, 'day').hour(9).minute(0).toISOString(),
      end: dayjs().add(1, 'day').hour(9).minute(45).toISOString(),
      branch: 'Gembloux - Orneau',
      raw: {
        status: 'pending',
        location: 'Room 203',
        participants: ['Sarah Johnson'],
        notes: 'Check mole and prescribe treatment.',
        icon: '👩‍⚕️',
      },
    },
    {
      id: '6',
      calendarId: 'therapy',
      title: '🧘 Group Yoga Session',
      category: 'allday',
      start: dayjs().add(2, 'day').toISOString(),
      end: dayjs().add(3, 'day').toISOString(),
      branch: 'Anima Corpus Namur',
      raw: {
        status: 'confirmed',
        location: 'Yoga Hall',
        participants: ['Instructor Mia', 'Group B'],
        notes: 'Wear comfortable clothing.',
        icon: '🧘',
      },
    },
    {
      id: '7',
      calendarId: 'meeting',
      title: '💼 Partner Clinic Collaboration Call',
      category: 'time',
      start: dayjs().add(3, 'day').hour(15).minute(0).toISOString(),
      end: dayjs().add(3, 'day').hour(16).minute(0).toISOString(),
      branch: 'Gembloux - Orneau',
      raw: {
        status: 'cancelled',
        location: 'Zoom',
        participants: ['External Partner', 'Admin Team'],
        notes: 'Reschedule for next week.',
        icon: '💼',
      },
    },
    {
      id: '8',
      calendarId: 'surgery',
      title: '🦴 Hip Replacement - Mrs. Clark',
      category: 'time',
      start: dayjs().add(4, 'day').hour(11).minute(0).toISOString(),
      end: dayjs().add(4, 'day').hour(14).minute(0).toISOString(),
      branch: 'Anima Corpus Namur',
      raw: {
        status: 'confirmed',
        location: 'OR-5',
        participants: ['Dr. Brown', 'Nurse Tom'],
        notes: 'Patient needs special post-op care.',
        icon: '🦴',
      },
    },
    {
      id: '9',
      calendarId: 'consultation',
      title: '🩺 Follow-up Consultation - Mark Lee',
      category: 'time',
      start: dayjs().add(5, 'day').hour(8).minute(30).toISOString(),
      end: dayjs().add(5, 'day').hour(9).minute(15).toISOString(),
      branch: 'Gembloux - Orneau',
      raw: {
        status: 'confirmed',
        location: 'Room 102',
        participants: ['Mark Lee'],
        notes: 'Review test results and update meds.',
        icon: '🩺',
      },
    },
    {
      id: '10',
      calendarId: 'meeting',
      title: '📞 Marketing Strategy Call',
      category: 'time',
      start: dayjs().add(6, 'day').hour(13).minute(0).toISOString(),
      end: dayjs().add(6, 'day').hour(14).minute(0).toISOString(),
      branch: 'Anima Corpus Namur',
      raw: {
        status: 'pending',
        location: 'Google Meet',
        participants: ['Marketing Lead', 'Clinic Director'],
        notes: 'Discuss Q4 campaigns.',
        icon: '📞',
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    const filtered = dummyAppointments
      .filter(
        (appt) =>
          selectedBranches.includes(appt.branch) && selectedCategories.includes(appt.calendarId),
      )
      .map((appt) => {
        // Style adjustments based on status
        let bgColor = CATEGORIES.find((c) => c.id === appt.calendarId)?.color;
        let borderColor = bgColor;
        if (appt.raw?.status === 'cancelled') {
          borderColor = '#000';
          bgColor = '#f8d7da';
        } else if (appt.raw?.status === 'pending') {
          bgColor = '#fff3cd';
        }
        return { ...appt, bgColor, borderColor };
      });
    setAppointments(filtered);
    setLoading(false);
  }, [selectedBranches, selectedCategories, selectedDate, view]);

  const calendars = CATEGORIES.map((cat) => ({
    id: cat.id,
    name: cat.name,
    color: '#fff',
    bgColor: cat.color,
    dragBgColor: cat.color,
    borderColor: cat.color,
  }));

  const handleBranchChange = (branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch],
    );
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId],
    );
  };

  const handleEventClick = (e: any) => {
    setSelectedEvent(e.event);
    setShowModal(true);
  };

  return (
    <>
      <PageTitle subName="Appointments" title="Appointment Calendar" />

      <Row style={{ height: '100%' }}>
        <Card>
          <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
            <CardTitle as="h4" className="mb-0">
              {calendarViewMode === 'calendar' ? "Appointment Calender" : "Appointment List"}
            </CardTitle>

            <Button
              variant="primary"
              onClick={() => router.push('/appointments/appointment-form')}
            >
              New Appointment
            </Button>
          </CardHeader>
        </Card>
        {/* Sidebar */}
        <Col
          md={3}
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minWidth: 0,
          }}
        >

          <div className="p-2 border rounded mb-3" style={{ background: 'white' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue || dayjs())}
                sx={{
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                  overflow: 'hidden',
                  '& .MuiPickersCalendarHeader-root': { px: 1, mb: 0.5 },
                  '& .MuiPickersCalendarHeader-label': { fontSize: '0.9rem' },
                  '& .MuiPickersArrowSwitcher-root .MuiIconButton-root': {
                    p: 0.5,
                  },
                  '& .MuiDayCalendar-weekDayLabel': { fontSize: '0.75rem' },
                  '& .MuiPickersDay-root': { fontSize: '0.75rem' },
                  '& .MuiDayCalendar-monthContainer': { mx: 0.5 },
                }}
              />
            </LocalizationProvider>
          </div>

          {/* Branch filter */}
          <div className="p-3 border rounded mb-3">
            <h6 className="mb-2">Branches</h6>
            {BRANCHES.map((branch) => (
              <Form.Check
                key={branch}
                type="checkbox"
                label={branch}
                checked={selectedBranches.includes(branch)}
                onChange={() => handleBranchChange(branch)}
              />
            ))}
          </div>

          {/* Category filter */}
          <div className="p-3 border rounded">
            <h6 className="mb-2">Categories</h6>
            {CATEGORIES.map((cat) => (
              <Form.Check
                key={cat.id}
                type="checkbox"
                label={
                  <span>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 12,
                        height: 12,
                        backgroundColor: cat.color,
                        marginRight: 8,
                      }}
                    />
                    {cat.name}
                  </span>
                }
                checked={selectedCategories.includes(cat.id)}
                onChange={() => handleCategoryChange(cat.id)}
              />
            ))}
          </div>
        </Col>

        {/* Main content */}
        <Col md={9} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded bg-light">
            <Dropdown as={ButtonGroup}>
              <Button variant="outline-primary" size="sm">
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Button>
              <Dropdown.Toggle split variant="outline-primary" size="sm" />
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setView('day')}>Day</Dropdown.Item>
                <Dropdown.Item onClick={() => setView('week')}>Week</Dropdown.Item>
                <Dropdown.Item onClick={() => setView('month')}>Month</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <h5 className="mb-0">{selectedDate.format('MMMM D, YYYY')}</h5>

            <ButtonGroup size="sm">
              <Button
                variant={calendarViewMode === 'calendar' ? 'primary' : 'outline-primary'}
                onClick={() => setCalendarViewMode('calendar')}
              >
                <Icon icon="mdi:calendar-month" width="18" />
              </Button>
              <Button
                variant={calendarViewMode === 'list' ? 'primary' : 'outline-primary'}
                onClick={() => setCalendarViewMode('list')}
              >
                <Icon icon="mdi:view-list" width="18" />
              </Button>
            </ButtonGroup>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : calendarViewMode === 'calendar' ? (
              <Calendar
                ref={calendarRef}
                height={calendarHeight}
                view={view}
                month={{ startDayOfWeek: 1 }}
                week={{ showTimezoneCollapseButton: true }}
                events={appointments}
                calendars={calendars}
                onClickEvent={handleEventClick}
              />
            ) : (
              <div
                className="p-3 border rounded bg-white"
                style={{ height: calendarHeight, overflowY: 'auto' }}
              >
                {appointments.length === 0 ? (
                  <p className="text-muted">No appointments found.</p>
                ) : (
                  appointments.map((appt) => (
                    <div key={appt.id} className="border-bottom py-2">
                      <strong>{appt.title}</strong>
                      <div>{dayjs(appt.start).format('MMM D, YYYY h:mm A')}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Modal for Event Details */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <>
              <p>
                <strong>Title:</strong> {selectedEvent.title}
              </p>
              <p>
                <strong>Branch:</strong> {selectedEvent.branch}
              </p>
              <p>
                <strong>Status:</strong> {selectedEvent.raw?.status}
              </p>
              <p>
                <strong>Location:</strong> {selectedEvent.raw?.location}
              </p>
              <p>
                <strong>Participants:</strong> {selectedEvent.raw?.participants?.join(', ')}
              </p>
              <p>
                <strong>Notes:</strong> {selectedEvent.raw?.notes}
              </p>
              <p>
                <strong>Time:</strong> {dayjs(selectedEvent.start).format('MMM D, YYYY h:mm A')} -{' '}
                {dayjs(selectedEvent.end).format('MMM D, YYYY h:mm A')}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AppointmentCalendarPage;
