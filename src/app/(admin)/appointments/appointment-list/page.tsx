'use client';

import PageTitle from '@/components/PageTitle';
import { useEffect, useState, useRef } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

import {
  Button,
  Col,
  Row,
  Spinner,
  Form,
  Dropdown,
  ButtonGroup,
  Modal,
  Card,
  CardHeader,
  CardTitle,
} from 'react-bootstrap';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import { Icon } from '@iconify/react';
import dynamic from 'next/dynamic';
import { API_BASE_PATH } from '@/context/constants';
import { useRouter } from 'next/navigation';

const Calendar = dynamic(() => import('@toast-ui/react-calendar'), {
  ssr: false,
});

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

interface Branch {
  branch_id: number;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  location?: string;
  is_active: boolean;
  created_at: string;
}

interface Department {
  id: number;
  name: string;
  is_active: boolean;
  description?: string;
}

interface Specialization {
  specialization_id: number;
  specialization_type: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  department?: Department;
  color?: string;
}

interface Appointment {
  id: string;
  calendarId: string;
  title: string;
  category: string;
  start: string;
  end: string;
  branch: string;
  department: string;
  specialization: string;
  bgColor: string;
  borderColor: string;
  raw: {
    status: string;
    location: string;
    participants: string[];
    notes: string;
    original: any;
  };
}

// 🔹 helper: normalize API response (handles array | {data:[]} | {data:{data:[]}})
const normalizeApiResponse = (data: any): any[] => {
  console.log('Normalizing API response:', data);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  console.log('API response format not recognized, returning empty array');
  return [];
};

const AppointmentCalendarPage = () => {
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [allSpecializations, setAllSpecializations] = useState<Specialization[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<number[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [calendarViewMode, setCalendarViewMode] = useState<'calendar' | 'list'>('calendar');
  const [calendarHeight] = useState('750px');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const calendarRef = useRef<any>(null);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const DEFAULT_COLORS = [
    '#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1',
    '#e83e8c', '#fd7e14', '#20c997', '#17a2b8', '#6c757d',
    '#6610f2', '#d63384', '#0dcaf0', '#198754', '#ffc107'
  ];

  const assignColorsToSpecializations = (specializations: Specialization[]): Specialization[] =>
    specializations.map((spec, index) => ({
      ...spec,
      color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    }));

  // 🔹 Fetch filters
  useEffect(() => {
    console.log('Fetching filter data...');
    const fetchFilterData = async () => {
      if (!token) {
        console.log('No token found, skipping filter fetch');
        return;
      }
      try {
        setLoadingFilters(true);

        // Branches
        console.log('Fetching branches...');
        const branchesRes = await fetch(`${API_BASE_PATH}/branches`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (branchesRes.ok) {
          const data = await branchesRes.json();
          console.log('Branches API response:', data);
          const branches: Branch[] = normalizeApiResponse(data);
          console.log('Normalized branches:', branches);
          setAllBranches(branches);
          setSelectedBranches(branches.map(b => b.branch_id));
        } else {
          console.warn('Failed to fetch branches, status:', branchesRes.status);
        }

        // Departments
        console.log('Fetching departments...');
        const departmentsRes = await fetch(`${API_BASE_PATH}/departments`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (departmentsRes.ok) {
          const data = await departmentsRes.json();
          console.log('Departments API response:', data);
          const departments: Department[] = normalizeApiResponse(data);
          console.log('Normalized departments:', departments);
          setAllDepartments(departments);
          setSelectedDepartments(departments.map(d => d.id));
        } else {
          console.warn('Failed to fetch departments, status:', departmentsRes.status);
        }

        // Specializations
        console.log('Fetching specializations...');
        const specializationsRes = await fetch(`${API_BASE_PATH}/specializations`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (specializationsRes.ok) {
          const data = await specializationsRes.json();
          console.log('Specializations API response:', data);
          const specializations: Specialization[] = normalizeApiResponse(data);
          console.log('Normalized specializations:', specializations);
          const withColors = assignColorsToSpecializations(specializations);
          setAllSpecializations(withColors);
          setSelectedSpecializations(withColors.map(s => s.specialization_id));
        } else {
          console.warn('Failed to fetch specializations, status:', specializationsRes.status);
        }
      } catch (err) {
        console.error('[Filters] fetch error:', err);
      } finally {
        console.log('Finished fetching filter data');
        setLoadingFilters(false);
      }
    };

    fetchFilterData();
  }, [token]);

  // 🔹 Fetch appointments - UPDATED MAPPING LOGIC
  useEffect(() => {
    console.log('Fetching appointments...');
    console.log('Token exists:', !!token);

    const fetchAppointments = async () => {
      if (!token) {
        console.log('No token, skipping appointment fetch');
        return;
      }

      try {
        setLoading(true);
        console.log('Making API call to fetch appointments...');
        const res = await fetch(`${API_BASE_PATH}/appointments?pageNo=1&limit=200`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });

        console.log('Appointments API response status:', res.status);

        if (!res.ok) {
          console.warn('Failed to fetch appointments, status:', res.status);
          setAllAppointments([]);
          return;
        }

        const json = await res.json();
        console.log('Appointments API raw response:', json);

        const fetched = normalizeApiResponse(json);
        console.log('Normalized appointments:', fetched);

        const mapped = fetched.map((appt: any) => {
          console.log('Processing appointment raw data:', appt);

          // Use the nested objects directly from the API response
          const branch = appt.branch;
          const department = appt.department;
          const specialization = appt.specialization;

          console.log('Branch from API:', branch);
          console.log('Department from API:', department);
          console.log('Specialization from API:', specialization);

          const start = appt.startTime ? new Date(appt.startTime) : null;
          const end = appt.endTime ? new Date(appt.endTime) : null;

          if (!start || isNaN(start.getTime())) {
            console.warn(`[Appointments] invalid start for appt id=${appt.id}`, appt.startTime);
          }
          if (!end || isNaN(end.getTime())) {
            console.warn(`[Appointments] invalid end for appt id=${appt.id}`, appt.endTime);
          }

          let bgColor = specialization?.color || '#6c757d';
          let borderColor = specialization?.color || '#6c757d';
          if (appt.status === 'cancelled') {
            bgColor = '#f8d7da';
            borderColor = '#000';
          } else if (appt.status === 'pending') {
            bgColor = '#fff3cd';
          }

          // Extract participant names
          const participants = [];
          if (appt.patient?.firstname || appt.patient?.lastname) {
            participants.push(`${appt.patient.firstname || ''} ${appt.patient.lastname || ''}`.trim());
          }
          if (appt.therapist?.fullName) {
            participants.push(appt.therapist.fullName);
          }
          if (appt.doctor?.name) {
            participants.push(appt.doctor.name);
          }

          const result = {
            id: String(appt.id),
            calendarId: String(specialization?.specialization_id || appt.specialization_id || 'unknown'),
            title: `${specialization?.specialization_type || 'Unknown'} - ${appt.patient?.firstname || ''} ${appt.patient?.lastname || ''}`.trim(),
            category: 'time',
            start: start?.toISOString() || '',
            end: end?.toISOString() || '',
            branch: branch?.name || 'Unknown Branch',
            department: department?.name || 'General',
            specialization: specialization?.specialization_type || 'Unknown Specialization',
            bgColor,
            borderColor,
            raw: {
              status: appt.status,
              location: branch?.address || appt.location || '',
              participants: participants.length > 0 ? participants : ['Unknown Participant'],
              notes: appt.description || appt.notes || appt.purposeOfVisit || '',
              original: appt,
            },
          };

          console.log('Mapped appointment:', result);
          return result;
        });

        console.log('All mapped appointments:', mapped);
        setAllAppointments(mapped);
      } catch (err) {
        console.error('[Appointments] fetch error:', err);
        setAllAppointments([]);
      } finally {
        console.log('Finished fetching appointments');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token, allBranches, allDepartments, allSpecializations]);

  // 🔹 Filtering pipeline
  useEffect(() => {
    console.log('Running filtering pipeline...');
    console.log('All appointments:', allAppointments);
    console.log('Selected branches:', selectedBranches);
    console.log('Selected specializations:', selectedSpecializations);
    console.log('Selected departments:', selectedDepartments);
    console.log('Selected date:', selectedDate.format());
    console.log('View:', view);

    if (!allAppointments?.length) {
      console.log('No appointments to filter');
      setAppointments([]);
      return;
    }

    let dateFiltered = allAppointments;
    if (view === 'month') {
      const start = selectedDate.startOf('month');
      const end = selectedDate.endOf('month');
      console.log('Month view - filtering between:', start.format(), 'and', end.format());
      dateFiltered = allAppointments.filter(appt =>
        appt.start && dayjs(appt.start).isBetween(start, end, null, '[]')
      );
    } else if (view === 'week') {
      const start = selectedDate.startOf('week');
      const end = selectedDate.endOf('week');
      console.log('Week view - filtering between:', start.format(), 'and', end.format());
      dateFiltered = allAppointments.filter(appt =>
        appt.start && dayjs(appt.start).isBetween(start, end, null, '[]')
      );
    } else if (view === 'day') {
      console.log('Day view - filtering for:', selectedDate.format());
      dateFiltered = allAppointments.filter(appt =>
        appt.start && dayjs(appt.start).isSame(selectedDate, 'day')
      );
    }

    console.log('Date filtered appointments:', dateFiltered);

    // FIXED FILTERING LOGIC: Handle appointments with missing IDs
    const finalFiltered = dateFiltered.filter(appt => {
      const branchId = appt.raw.original.branch_id;
      const specId = appt.raw.original.specialization_id;
      const deptId = appt.raw.original.department_id;

      console.log(`Appt ${appt.id} - branchId: ${branchId}, specId: ${specId}, deptId: ${deptId}`);

      // If IDs are missing (undefined), include them in all filters
      // If IDs are present, check if they match the selected filters
      const branchMatch = branchId === undefined || selectedBranches.includes(branchId);
      const specMatch = specId === undefined || selectedSpecializations.includes(specId);
      const deptMatch = deptId === undefined || selectedDepartments.includes(deptId);

      console.log(`Appt ${appt.id} - branch: ${branchMatch}, spec: ${specMatch}, dept: ${deptMatch}`);

      return branchMatch && specMatch && deptMatch;
    });

    console.log('Final filtered appointments:', finalFiltered);
    setAppointments(finalFiltered);
  }, [
    allAppointments,
    selectedDate,
    view,
    selectedBranches,
    selectedSpecializations,
    selectedDepartments,
  ]);

  const calendars = allSpecializations.map(spec => ({
    id: String(spec.specialization_id),
    name: spec.specialization_type,
    color: '#fff',
    bgColor: spec.color || '#6c757d',
    dragBgColor: spec.color || '#6c757d',
    borderColor: spec.color || '#6c757d',
  }));

  const handleBranchChange = (branchId: number) => {
    setSelectedBranches(prev =>
      prev.includes(branchId) ? prev.filter(id => id !== branchId) : [...prev, branchId]
    );
  };

  const handleSpecializationChange = (specId: number) => {
    setSelectedSpecializations(prev =>
      prev.includes(specId) ? prev.filter(id => id !== specId) : [...prev, specId]
    );
  };

  const handleDepartmentChange = (deptId: number) => {
    setSelectedDepartments(prev =>
      prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]
    );
  };

  const handleEventClick = (e: any) => {
    const event = e?.event ?? e;
    setSelectedEvent(event);
    setShowModal(true);
  };

  const resetAllFilters = () => {
    setSelectedBranches(allBranches.map(b => b.branch_id));
    setSelectedSpecializations(allSpecializations.map(s => s.specialization_id));
    setSelectedDepartments(allDepartments.map(d => d.id));
    setSelectedDate(dayjs());
    setView('month');
  };

  const toggleAllSelection = (type: 'branches' | 'specializations' | 'departments') => {
    if (type === 'branches') {
      setSelectedBranches(
        selectedBranches.length === allBranches.length ? [] : allBranches.map(b => b.branch_id)
      );
    } else if (type === 'specializations') {
      setSelectedSpecializations(
        selectedSpecializations.length === allSpecializations.length ? [] : allSpecializations.map(s => s.specialization_id)
      );
    } else if (type === 'departments') {
      setSelectedDepartments(
        selectedDepartments.length === allDepartments.length ? [] : allDepartments.map(d => d.id)
      );
    }
  };

  console.log('Rendering with appointments:', appointments);
  console.log('Calendar view mode:', calendarViewMode);

  return (
    <>
      <PageTitle subName="Appointments" title="Appointment Calendar" />

      <Row style={{ height: '100%' }}>
        <Card>
          <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
            <CardTitle as="h4" className="mb-0">
              {calendarViewMode === 'calendar' ? 'Appointment Calendar' : 'Appointment List'}
            </CardTitle>
            <Button variant="primary" onClick={() => router.push('/appointments/appointment-form')}>
              New Appointment
            </Button>
          </CardHeader>
        </Card>

        {/* Sidebar */}
        <Col md={3} style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
          <div className="p-2 border rounded mb-3" style={{ background: 'white' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue || dayjs())}
              />
            </LocalizationProvider>
          </div>

          <div className="mb-3">
            <Button variant="outline-secondary" size="sm" onClick={resetAllFilters} className="w-100">
              <Icon icon="mdi:refresh" className="me-1" />
              Reset All Filters
            </Button>
          </div>

          {/* Branch filter */}
          <div className="p-3 border rounded mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Branches</h6>
              <Button variant="link" size="sm" onClick={() => toggleAllSelection('branches')}>
                {selectedBranches.length === allBranches.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            {loadingFilters ? (
              <div className="text-center"><Spinner animation="border" size="sm" /></div>
            ) : (
              allBranches.map(branch => (
                <Form.Check
                  key={branch.branch_id}
                  type="checkbox"
                  label={branch.name}
                  checked={selectedBranches.includes(branch.branch_id)}
                  onChange={() => handleBranchChange(branch.branch_id)}
                />
              ))
            )}
          </div>

          {/* Specialization filter */}
          <div className="p-3 border rounded mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Specializations</h6>
              <Button variant="link" size="sm" onClick={() => toggleAllSelection('specializations')}>
                {selectedSpecializations.length === allSpecializations.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            {loadingFilters ? (
              <div className="text-center"><Spinner animation="border" size="sm" /></div>
            ) : (
              allSpecializations.map(spec => (
                <Form.Check
                  key={spec.specialization_id}
                  type="checkbox"
                  label={<span><span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: spec.color, marginRight: 8 }} />{spec.specialization_type}</span>}
                  checked={selectedSpecializations.includes(spec.specialization_id)}
                  onChange={() => handleSpecializationChange(spec.specialization_id)}
                />
              ))
            )}
          </div>

          {/* Department filter */}
          <div className="p-3 border rounded mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Departments</h6>
              <Button variant="link" size="sm" onClick={() => toggleAllSelection('departments')}>
                {selectedDepartments.length === allDepartments.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            {loadingFilters ? (
              <div className="text-center"><Spinner animation="border" size="sm" /></div>
            ) : allDepartments.length === 0 ? (
              <div className="text-muted small">No departments found</div>
            ) : (
              allDepartments.map(dept => (
                <Form.Check
                  key={dept.id}
                  type="checkbox"
                  label={dept.name}
                  checked={selectedDepartments.includes(dept.id)}
                  onChange={() => handleDepartmentChange(dept.id)}
                />
              ))
            )}
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
                Calendar View
              </Button>
              <Button
                variant={calendarViewMode === 'list' ? 'primary' : 'outline-primary'}
                onClick={() => setCalendarViewMode('list')}
              >
                List View
              </Button>
            </ButtonGroup>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center flex-grow-1">
              <Spinner animation="border" />
            </div>
          ) : calendarViewMode === 'calendar' ? (
            <div className="flex-grow-1 border rounded overflow-hidden">
              <Calendar
                ref={calendarRef}
                height={calendarHeight}
                view={view}
                useDetailPopup={false}
                useCreationPopup={false}
                calendars={calendars}
                events={appointments}
                isReadOnly
                onClickEvent={handleEventClick}
              />
            </div>
          ) : (
            <div className="flex-grow-1 border rounded p-3 bg-white">
              <h5 className="mb-3">Appointments</h5>
              {appointments.length === 0 ? (
                <p className="text-muted">No appointments found for selected filters.</p>
              ) : (
                appointments.map(event => (
                  <div key={event.id} className="border-bottom py-2">
                    <strong>{event.title}</strong> <br />
                    {dayjs(event.start).format('MMM D, YYYY h:mm A')} -{' '}
                    {dayjs(event.end).format('h:mm A')} <br />
                    <small>{event.branch} | {event.department} | {event.specialization}</small>
                  </div>
                ))
              )}
            </div>
          )}
        </Col>
      </Row>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {console.log(selectedEvent, "event")}
          {selectedEvent ? (
            <>
              <h5>{selectedEvent.title}</h5>
              <p><strong>Date:</strong> {dayjs(selectedEvent.start).format('MMMM D, YYYY')}</p>
              <p><strong>Time:</strong> {dayjs(selectedEvent.start).format('h:mm A')} - {dayjs(selectedEvent.end).format('h:mm A')}</p>
              <p><strong>Branch:</strong> {selectedEvent.raw.original?.branch.name}</p>
              <p><strong>Department:</strong> {selectedEvent.department}</p>
              <p><strong>Specialization:</strong> {selectedEvent.specialization}</p>
              <p><strong>Status:</strong> {selectedEvent.raw.status}</p>
              <p><strong>Location:</strong> {selectedEvent.raw.location}</p>
              <p><strong>Participants:</strong> {selectedEvent.raw.participants.join(', ')}</p>
              <p><strong>Notes:</strong> {selectedEvent.raw.notes}</p>
            </>
          ) : (
            <p>No appointment selected.</p>
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