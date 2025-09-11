'use client';

import PageTitle from '@/components/PageTitle';
import { useEffect, useState, useRef, useCallback, SetStateAction } from 'react';
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
  loading: () => <div>Loading calendar...</div>
});

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import TuiCalendar from '@/components/TuiCalendarWrapper';

interface Branch {
  branch_id: number;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  location?: string;
  is_active: boolean;
  created_at: string;
  color?: string;
}

interface Department {
  id: number;
  name: string;
  is_active: boolean;
  description?: string;
  color?: string;
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
  dragBgColor: string;
  color: string;
  raw: {
    status: string;
    location: string;
    participants: string[];
    notes: string;
    original: any;
  };
}

// Helper: normalize API response (handles array | {data:[]} | {data:{data:[]}})
const normalizeApiResponse = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
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
  const [calendarDate, setCalendarDate] = useState<Dayjs>(dayjs()); // For sync with Toast UI Calendar
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [calendarViewMode, setCalendarViewMode] = useState<'calendar' | 'list'>('calendar');
  const [calendarHeight] = useState('750px');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [moreEvents, setMoreEvents] = useState<any[]>([]);
  const [calendarInstance, setCalendarInstance] = useState<any | null>(null);

  const calendarRef = useRef<{ setDate: (date: Date) => void }>(null);



  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // Enhanced color palettes for different categories
  const BRANCH_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  const DEPARTMENT_COLORS = [
    '#6C5CE7', '#A29BFE', '#74B9FF', '#00CEC9', '#55A3FF',
    '#FDCB6E', '#E17055', '#FD79A8', '#FDCB6E', '#E84393'
  ];

  const SPECIALIZATION_COLORS = [
    '#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1',
    '#e83e8c', '#fd7e14', '#20c997', '#17a2b8', '#6c757d',
    '#6610f2', '#d63384', '#0dcaf0', '#198754', '#ff6b35'
  ];

  const assignColorsToItems = <T extends { [key: string]: any }>(
    items: T[],
    colors: string[],
    idKey: string
  ): T[] =>
    items.map((item, index) => ({
      ...item,
      color: colors[index % colors.length],
    }));

  // Calendar instance getter
  const getCalInstance = useCallback(() => {
    if (!calendarRef.current) {
      console.error('Calendar ref is not initialized');
      return null;
    }
    return calendarRef.current.getInstance();
  }, []);

  const handleSetDate = useCallback(() => {
    if (calendarRef.current) {
      // Example: Set the date to January 1, 2026
      calendarRef.current.setDate(new Date(2026, 0, 1));
    }
  }, []);


  // Handle calendar navigation
  // const handleCalendarNav = (action: 'today' | 'prev' | 'next') => {
  //   const calendarInstance = getCalInstance();
  //   if (calendarInstance) {
  //     switch (action) {
  //       case 'today':
  //         calendarInstance.today();
  //         break;
  //       case 'prev':
  //         calendarInstance.prev();
  //         break;
  //       case 'next':
  //         calendarInstance.next();
  //         break;
  //     }

  //     // Update our state to match the calendar's new date
  //     const newDate = dayjs(calendarInstance.getDate());
  //     setSelectedDate(newDate);
  //     setCalendarDate(newDate);
  //   }
  // };

  const handleDateChange = useCallback((newDate: Dayjs | null) => {
    if (newDate) {
      setSelectedDate(newDate);
      setCalendarDate(newDate);

      // Sync with Toast UI Calendar
      if (calendarRef.current) {
        calendarRef.current.setDate(newDate.toDate()); // Call setDate on the child component
      }

      // Auto-switch to day view when clicking on a specific date
      if (view === 'month') {
        setView('day');
      }
    }
  }, [view]);

  // Sync calendar on navigation and view changes
  // useEffect(() => {
  //   const calendarInstance = calendarRef.current?.getInstance?.();
  //   if (calendarInstance && selectedDate) {
  //     calendarInstance.setDate(selectedDate.toDate());
  //     calendarInstance.changeView(view);
  //     calendarInstance.render();
  //   }
  // }, [selectedDate, view, getCalInstance]);

  // Fetch filters with color assignment
  useEffect(() => {
    const fetchFilterData = async () => {
      if (!token) {
        return;
      }
      try {
        setLoadingFilters(true);

        // Branches
        const branchesRes = await fetch(`${API_BASE_PATH}/branches`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (branchesRes.ok) {
          const data = await branchesRes.json();
          const branches: Branch[] = normalizeApiResponse(data);
          const branchesWithColors = assignColorsToItems(branches, BRANCH_COLORS, 'branch_id');
          setAllBranches(branchesWithColors);
          setSelectedBranches(branchesWithColors.map(b => b.branch_id));
        }

        // Departments
        const departmentsRes = await fetch(`${API_BASE_PATH}/departments`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (departmentsRes.ok) {
          const data = await departmentsRes.json();
          const departments: Department[] = normalizeApiResponse(data);
          const departmentsWithColors = assignColorsToItems(departments, DEPARTMENT_COLORS, 'id');
          setAllDepartments(departmentsWithColors);
          setSelectedDepartments(departmentsWithColors.map(d => d.id));
        }

        // Specializations
        const specializationsRes = await fetch(`${API_BASE_PATH}/specializations`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (specializationsRes.ok) {
          const data = await specializationsRes.json();
          const specializations: Specialization[] = normalizeApiResponse(data);
          const specializationsWithColors = assignColorsToItems(specializations, SPECIALIZATION_COLORS, 'specialization_id');
          setAllSpecializations(specializationsWithColors);
          setSelectedSpecializations(specializationsWithColors.map(s => s.specialization_id));
        }
      } catch (err) {
        // Handle error silently or add proper error handling
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilterData();
  }, [token]);

  // Fetch appointments with enhanced color logic and status handling
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) {
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_PATH}/appointments?pageNo=1&limit=200`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setAllAppointments([]);
          return;
        }

        const json = await res.json();
        const fetched = normalizeApiResponse(json);

        const mapped = fetched.map((appt: any) => {
          const branch = appt.branch;
          const department = appt.department;
          const specialization = appt.specialization;

          const start = appt.startTime ? new Date(appt.startTime) : null;
          const end = appt.endTime ? new Date(appt.endTime) : null;

          if (!start || isNaN(start.getTime())) {
            // Handle invalid start time
          }
          if (!end || isNaN(end.getTime())) {
            // Handle invalid end time
          }

          // Enhanced color logic with status and timing considerations
          const now = dayjs();
          const appointmentStart = dayjs(start);
          const isToday = appointmentStart.isSame(now, 'day');
          const isPast = appointmentStart.isBefore(now);

          // Find colors from our loaded data
          const branchColor = allBranches.find(b => b.branch_id === appt.branch_id)?.color || BRANCH_COLORS[0];
          const departmentColor = allDepartments.find(d => d.id === appt.department_id)?.color || DEPARTMENT_COLORS[0];
          const specializationColor = allSpecializations.find(s => s.specialization_id === appt.specialization_id)?.color || SPECIALIZATION_COLORS[0];

          let bgColor = specializationColor;
          let borderColor = specializationColor;
          let dragBgColor = specializationColor;
          let color = '#ffffff'; // Text color

          // Status-based color modifications
          if (appt.status === 'cancelled') {
            bgColor = '#f8d7da';
            borderColor = '#dc3545';
            color = '#721c24';
          } else if (appt.status === 'pending') {
            bgColor = '#fff3cd';
            borderColor = '#ffc107';
            color = '#856404';
          } else if (appt.status === 'completed') {
            bgColor = '#d1edff';
            borderColor = '#0c63e4';
            color = '#084298';
          }

          // Time-based modifications
          if (isPast && appt.status !== 'cancelled') {
            // Gray out past appointments
            bgColor = '#e9ecef';
            borderColor = '#6c757d';
            color = '#495057';
          }

          if (isToday && appt.status === 'confirmed') {
            // Highlight today's confirmed appointments with blue border
            borderColor = '#007bff';
            // Make border thicker for today's appointments
            borderColor = `3px solid ${borderColor}`;
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
          if (appt.staff?.name) {
            participants.push(appt.staff.name);
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
            dragBgColor,
            color,
            raw: {
              status: appt.status,
              location: branch?.address || appt.location || '',
              participants: participants.length > 0 ? participants : ['Unknown Participant'],
              notes: appt.description || appt.notes || appt.purposeOfVisit || '',
              original: appt,
            },
          };

          return result;
        });

        setAllAppointments(mapped);
      } catch (err) {
        setAllAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch appointments after filter data is loaded
    if (allBranches.length > 0 || allDepartments.length > 0 || allSpecializations.length > 0) {
      fetchAppointments();
    }
  }, [token, allBranches, allDepartments, allSpecializations]);

  // Enhanced filtering pipeline with proper date range syncing
  useEffect(() => {
    if (!allAppointments?.length) {
      setAppointments([]);
      return;
    }

    // Enhanced date filtering based on selected date and view
    let dateFiltered = allAppointments;
    if (view === 'month') {
      const start = selectedDate.startOf('month');
      const end = selectedDate.endOf('month');
      dateFiltered = allAppointments.filter(appt =>
        appt.start && dayjs(appt.start).isBetween(start, end, null, '[]')
      );
    } else if (view === 'week') {
      const start = selectedDate.startOf('week');
      const end = selectedDate.endOf('week');
      dateFiltered = allAppointments.filter(appt =>
        appt.start && dayjs(appt.start).isBetween(start, end, null, '[]')
      );
    } else if (view === 'day') {
      dateFiltered = allAppointments.filter(appt =>
        appt.start && dayjs(appt.start).isSame(selectedDate, 'day')
      );
    }

    // Enhanced filtering logic with null safety
    const finalFiltered = dateFiltered.filter(appt => {
      const branchId = appt.raw.original?.branch_id || appt.raw.original?.branch?.branch_id;
      const specId = appt.raw.original?.specialization_id || appt.raw.original?.specialization?.specialization_id;
      const deptId = appt.raw.original?.department_id || appt.raw.original?.department?.id;

      // If IDs are missing (undefined), include them in all filters
      // If IDs are present, check if they match the selected filters
      const branchMatch = branchId === undefined || selectedBranches.includes(branchId);
      const specMatch = specId === undefined || selectedSpecializations.includes(specId);
      const deptMatch = deptId === undefined || selectedDepartments.includes(deptId);

      return branchMatch && specMatch && deptMatch;
    });

    setAppointments(finalFiltered);
  }, [
    allAppointments,
    selectedDate,
    view,
    selectedBranches,
    selectedSpecializations,
    selectedDepartments,
  ]);

  // Enhanced calendars configuration with proper colors
  const calendars = allSpecializations.map(spec => ({
    id: String(spec.specialization_id),
    name: spec.specialization_type,
    color: '#ffffff',
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

  // Handle "more" events click in month view
  const handleMoreEventsClick = (e: any) => {
    const events = e.events || [];
    setMoreEvents(events);
    setShowMoreModal(true);
  };

  // Enhanced view change handler
  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    setView(newView);
  };

  const resetAllFilters = () => {
    setSelectedBranches(allBranches.map(b => b.branch_id));
    setSelectedSpecializations(allSpecializations.map(s => s.specialization_id));
    setSelectedDepartments(allDepartments.map(d => d.id));
    setSelectedDate(dayjs());
    setCalendarDate(dayjs());
    setView('month');

    // Sync with Toast UI Calendar
    const calendarInstance = getCalInstance();
    if (calendarInstance) {
      calendarInstance.today();
      calendarInstance.changeView('month');
    }
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

  // Helper function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'completed': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <>
      <PageTitle subName="Appointments" title="Appointment Calendar" />
      <Row style={{ height: '100%' }} >
        <Card>
          <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
            <CardTitle as="h4" className="mb-0">
              {calendarViewMode === 'calendar' ? 'Appointment Calendar' : 'Appointment List'}
              <small className="text-muted ms-2">({appointments.length} appointments)</small>
            </CardTitle>
            <Button variant="primary" onClick={() => router.push('/appointments/appointment-form')}>
              <Icon icon="mdi:plus" className="me-1" />
              New Appointment
            </Button>
          </CardHeader>
        </Card>

        {/* Enhanced Sidebar */}
        <Col md={3} style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
          <div className="p-2 border rounded mb-3" style={{ background: 'white' }} >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={selectedDate}
                onChange={handleDateChange}
                showDaysOutsideCurrentMonth
                fixedWeekNumber={6}
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                  overflow: "hidden",
                  "& .MuiPickersCalendarHeader-root": { px: 1, mb: 0.5 },
                  "& .MuiPickersCalendarHeader-label": { fontSize: "0.9rem" },
                  "& .MuiPickersArrowSwitcher-root .MuiIconButton-root": {
                    p: 0.5,
                  },
                  "& .MuiDayCalendar-weekDayLabel": { fontSize: "0.75rem" },
                  "& .MuiPickersDay-root": { fontSize: "0.75rem" },
                  "& .MuiDayCalendar-monthContainer": { mx: 0.5 },
                }}
              />
            </LocalizationProvider>
          </div>

          <div className="mb-3">
            <Button variant="outline-secondary" size="sm" onClick={resetAllFilters} className="w-100">
              <Icon icon="mdi:refresh" className="me-1" />
              Reset All Filters
            </Button>
          </div>

          {/* Enhanced Branch filter with colors */}
          <div className="p-3 border rounded mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">
                <Icon icon="mdi:office-building" className="me-1" />
                Branches
              </h6>
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
                  label={
                    <span>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          backgroundColor: branch.color,
                          marginRight: 8,
                          borderRadius: '2px'
                        }}
                      />
                      {branch.name}
                    </span>
                  }
                  checked={selectedBranches.includes(branch.branch_id)}
                  onChange={() => handleBranchChange(branch.branch_id)}
                />
              ))
            )}
          </div>

          {/* Enhanced Department filter with colors */}
          <div className="p-3 border rounded mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">
                <Icon icon="mdi:domain" className="me-1" />
                Departments
              </h6>
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
                  label={
                    <span>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          backgroundColor: dept.color,
                          marginRight: 8,
                          borderRadius: '2px'
                        }}
                      />
                      {dept.name}
                    </span>
                  }
                  checked={selectedDepartments.includes(dept.id)}
                  onChange={() => handleDepartmentChange(dept.id)}
                />
              ))
            )}
          </div>

          {/* Enhanced Specialization filter with colors */}
          <div className="p-3 border rounded mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">
                <Icon icon="mdi:medical-bag" className="me-1" />
                Specializations
              </h6>
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
                  label={
                    <span>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          backgroundColor: spec.color,
                          marginRight: 8,
                          borderRadius: '2px'
                        }}
                      />
                      {spec.specialization_type}
                    </span>
                  }
                  checked={selectedSpecializations.includes(spec.specialization_id)}
                  onChange={() => handleSpecializationChange(spec.specialization_id)}
                />
              ))
            )}
          </div>
        </Col>

        {/* Enhanced Main content */}
        <Col md={9} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded bg-light">
            <Dropdown as={ButtonGroup}>
              <Button variant="outline-primary" size="sm">
                <Icon icon={`mdi:calendar-${view}`} className="me-1" />
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Button>
              <Dropdown.Toggle split variant="outline-primary" size="sm" ><IconifyIcon icon="ri:arrow-down-s-line" className="fs-18" /></Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleViewChange('day')}>
                  <Icon icon="mdi:calendar-today" className="me-2 d-none d-sm-inline" />
                  Day
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleViewChange('week')}>
                  <Icon icon="mdi:calendar-week" className="me-2 d-none d-sm-inline" />
                  Week
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleViewChange('month')}>
                  <Icon icon="mdi:calendar-month" className="me-2 d-none d-sm-inline" />
                  Month
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <div className="text-center">
              <h5 className="mb-0">{selectedDate.format('MMMM D, YYYY')}</h5>
              <small className="text-muted">
                {view === 'week' && `Week of ${selectedDate.startOf('week').format('MMM D')} - ${selectedDate.endOf('week').format('MMM D')}`}
                {view === 'month' && `${appointments.length} appointments this month`}
                {view === 'day' && `${appointments.length} appointments today`}
              </small>
            </div>

            <ButtonGroup size="sm">
              <Button
                variant={calendarViewMode === 'calendar' ? 'primary' : 'outline-primary'}
                onClick={() => setCalendarViewMode('calendar')}
              >
                <Icon icon="mdi:calendar" className="me-1" />
                <span className="d-none d-sm-inline">Calendar View</span>
              </Button>
              <Button
                variant={calendarViewMode === 'list' ? 'primary' : 'outline-primary'}
                onClick={() => setCalendarViewMode('list')}
              >
                <Icon icon="mdi:format-list-bulleted" className="me-1" />
                <span className="d-none d-sm-inline">List View</span>
              </Button>
            </ButtonGroup>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center flex-grow-1">
              <Spinner animation="border" />
              <span className="ms-2">Loading appointments...</span>
            </div>
          ) : calendarViewMode === 'calendar' ? (
            <div className="flex-grow-1 border rounded overflow-hidden">
              {/* <button onClick={handleSetDate}>Set Date to Jan 2026</button>
              <TuiCalendar ref={calendarRef} /> */}
              <TuiCalendar
                ref={calendarRef}
                height={calendarHeight}
                view={view}
                useDetailPopup={false}
                useCreationPopup={false}
                calendars={calendars}
                events={appointments}
                isReadOnly
                onClickEvent={handleEventClick}
                onClickMore={(e: { event: { stop: () => void; }; events: SetStateAction<any[]>; }) => {
                  // ✅ Prevent Toast UI’s built-in popup
                  e.event.stop();

                  // ✅ Open your own modal instead
                  setMoreEvents(e.events);
                  setShowMoreModal(true);
                }}

                month={{
                  startDayOfWeek: 0,
                  daynames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                  visibleWeeksCount: 6,
                  moreLayerSize: {
                    width: '300px',
                    height: 'auto'
                  }
                }}
                week={{
                  startDayOfWeek: 0,
                  daynames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                  hourStart: 8,
                  hourEnd: 20,
                }}
                timezone={{
                  zones: [{
                    timezoneName: 'Asia/Kolkata',
                    displayLabel: 'IST',
                  }]
                }}
              />
            </div>
          ) : (
            <div className="flex-grow-1 border rounded p-3 bg-white overflow-auto">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Appointments List</h5>
                <small className="text-muted">{appointments.length} results</small>
              </div>
              {appointments.length === 0 ? (
                <div className="text-center py-5">
                  <Icon icon="mdi:calendar-remove" className="text-muted mb-3" />
                  <p className="text-muted">No appointments found for selected filters and date range.</p>
                </div>
              ) : (
                <div className="row">
                  {appointments.map(event => {
                    const isToday = dayjs(event.start).isSame(dayjs(), 'day');
                    const isPast = dayjs(event.start).isBefore(dayjs());

                    return (
                      <div key={event.id} className="col-12 mb-3">
                        <Card
                          className={`h-100 ${isToday ? 'border-primary' : ''} ${isPast ? 'opacity-75' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleEventClick(event)}
                        >
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="d-flex align-items-center">
                                <span
                                  style={{
                                    display: 'inline-block',
                                    width: 16,
                                    height: 16,
                                    backgroundColor: event.bgColor,
                                    marginRight: 8,
                                    borderRadius: '3px'
                                  }}
                                />
                                <strong className="text-truncate">{event.title}</strong>
                              </div>
                              <span className={`badge bg-${getStatusBadgeColor(event.raw.status)}`}>
                                {event.raw.status || 'Unknown'}
                              </span>
                            </div>

                            <div className="mb-2">
                              <small className="text-muted">
                                <Icon icon="mdi:clock-outline" className="me-1" />
                                {dayjs(event.start).format('MMM D, YYYY h:mm A')} - {dayjs(event.end).format('h:mm A')}
                                {isToday && <span className="badge bg-info ms-2">Today</span>}
                              </small>
                            </div>

                            <div className="row text-sm">
                              <div className="col-12 mb-1">
                                <Icon icon="mdi:office-building" className="me-1 text-muted" />
                                <small><strong>Branch:</strong> {event.branch}</small>
                              </div>
                              <div className="col-12 mb-1">
                                <Icon icon="mdi:domain" className="me-1 text-muted" />
                                <small><strong>Department:</strong> {event.department}</small>
                              </div>
                              <div className="col-12 mb-1">
                                <Icon icon="mdi:medical-bag" className="me-1 text-muted" />
                                <small><strong>Specialization:</strong> {event.specialization}</small>
                              </div>
                              {event.raw.participants.length > 0 && (
                                <div className="col-12">
                                  <Icon icon="mdi:account-group" className="me-1 text-muted" />
                                  <small><strong>Participants:</strong> {event.raw.participants.join(', ')}</small>
                                </div>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>

      {/* Enhanced Modal with complete data display */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon icon="mdi:calendar-account" className="me-2" />
            Appointment Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent ? (
            <div className="row">
              <div className="col-12 mb-4">
                <div className="d-flex align-items-center mb-3">
                  <span
                    style={{
                      display: 'inline-block',
                      width: 20,
                      height: 20,
                      backgroundColor: selectedEvent.bgColor,
                      marginRight: 12,
                      borderRadius: '4px'
                    }}
                  />
                  <h5 className="mb-0">{selectedEvent.title}</h5>
                  <span className={`badge bg-${getStatusBadgeColor(selectedEvent.raw.status)} ms-auto`}>
                    {selectedEvent.raw.status || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <Icon icon="mdi:calendar" className="me-2 text-primary" />
                  <strong>Date:</strong> {dayjs(selectedEvent.start).format('MMMM D, YYYY')}
                </div>
                <div className="mb-3">
                  <Icon icon="mdi:clock-outline" className="me-2 text-primary" />
                  <strong>Time:</strong> {dayjs(selectedEvent.start).format('h:mm A')} - {dayjs(selectedEvent.end).format('h:mm A')}
                </div>
                <div className="mb-3">
                  <Icon icon="mdi:office-building" className="me-2 text-primary" />
                  <strong>Branch:</strong> {selectedEvent.raw.original?.branch?.name || selectedEvent.branch}
                </div>
                <div className="mb-3">
                  <Icon icon="mdi:domain" className="me-2 text-primary" />
                  <strong>Department:</strong> {selectedEvent.raw.original?.department?.name || selectedEvent.department}
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <Icon icon="mdi:medical-bag" className="me-2 text-success" />
                  <strong>Specialization:</strong> {selectedEvent.raw.original?.specialization?.specialization_type || selectedEvent.specialization}
                </div>
                <div className="mb-3">
                  <Icon icon="mdi:map-marker" className="me-2 text-success" />
                  <strong>Location:</strong> {selectedEvent.raw.original?.branch?.address || selectedEvent.raw.location || 'Not specified'}
                </div>
                <div className="mb-3">
                  <Icon icon="mdi:phone" className="me-2 text-success" />
                  <strong>Contact:</strong> {selectedEvent.raw.original?.branch?.phone || 'Not specified'}
                </div>
                <div className="mb-3">
                  <Icon icon="mdi:email" className="me-2 text-success" />
                  <strong>Email:</strong> {selectedEvent.raw.original?.branch?.email || 'Not specified'}
                </div>
              </div>

              <div className="col-12">
                <hr />
                <div className="mb-3">
                  <Icon icon="mdi:account-group" className="me-2 text-info" />
                  <strong>Participants:</strong>
                  <ul className="list-unstyled mt-2 ms-4">
                    {selectedEvent.raw.participants.map((participant: string, index: number) => (
                      <li key={index}>
                        <Icon icon="mdi:account" className="me-2" />
                        {participant}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Additional patient information */}
                {selectedEvent.raw.original?.patient && (
                  <div className="mb-3">
                    <Icon icon="mdi:account-heart" className="me-2 text-danger" />
                    <strong>Patient Details:</strong>
                    <div className="ms-4 mt-2">
                      <p className="mb-1">
                        <strong>Name:</strong> {selectedEvent.raw.original.patient.firstname} {selectedEvent.raw.original.patient.lastname}
                      </p>
                      {selectedEvent.raw.original.patient.email && (
                        <p className="mb-1">
                          <strong>Email:</strong> {selectedEvent.raw.original.patient.email}
                        </p>
                      )}
                      {selectedEvent.raw.original.patient.phone && (
                        <p className="mb-1">
                          <strong>Phone:</strong> {selectedEvent.raw.original.patient.phone}
                        </p>
                      )}
                      {selectedEvent.raw.original.patient.age && (
                        <p className="mb-1">
                          <strong>Age:</strong> {selectedEvent.raw.original.patient.age}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Therapist/Doctor information */}
                {(selectedEvent.raw.original?.therapist || selectedEvent.raw.original?.doctor) && (
                  <div className="mb-3">
                    <Icon icon="mdi:doctor" className="me-2 text-warning" />
                    <strong>Healthcare Provider:</strong>
                    <div className="ms-4 mt-2">
                      {selectedEvent.raw.original.therapist && (
                        <p className="mb-1">
                          <strong>Therapist:</strong> {selectedEvent.raw.original.therapist.fullName}
                        </p>
                      )}
                      {selectedEvent.raw.original.doctor && (
                        <p className="mb-1">
                          <strong>Doctor:</strong> {selectedEvent.raw.original.doctor.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedEvent.raw.notes && (
                  <div className="mb-3">
                    <Icon icon="mdi:note-text" className="me-2 text-secondary" />
                    <strong>Notes:</strong>
                    <p className="mt-2 p-2 bg-light rounded">{selectedEvent.raw.notes}</p>
                  </div>
                )}

                {/* Additional appointment details */}
                <div className="row mt-3">
                  <div className="col-md-6">
                    <small className="text-muted">
                      <strong>Appointment ID:</strong> {selectedEvent.id}
                    </small>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">
                      <strong>Created:</strong> {selectedEvent.raw.original?.created_at ? dayjs(selectedEvent.raw.original.created_at).format('MMM D, YYYY') : 'N/A'}
                    </small>
                  </div>
                  {selectedEvent.raw.original?.purposeOfVisit && (
                    <div className="col-12 mt-2">
                      <small className="text-muted">
                        <strong>Purpose of Visit:</strong> {selectedEvent.raw.original.purposeOfVisit}
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Icon icon="mdi:calendar-remove" className="text-muted mb-3" />
              <p>No appointment selected.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            <Icon icon="mdi:close" className="me-1" />
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for "More" events in month view */}
      <Modal show={showMoreModal} onHide={() => setShowMoreModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon icon="mdi:calendar-multiple" className="me-2" />
            More Appointments
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h6 className="text-muted">All appointments for this day:</h6>
          </div>
          {moreEvents.length === 0 ? (
            <div className="text-center py-4">
              <Icon icon="mdi:calendar-remove" className="text-muted mb-3" />
              <p>No additional appointments found.</p>
            </div>
          ) : (
            <div className="list-group">
              {moreEvents.map((event: any, index: number) => (
                <div
                  key={`${event.id}-${index}`}
                  className="list-group-item list-group-item-action"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setShowMoreModal(false);
                    handleEventClick(event);
                  }}
                >
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="d-flex align-items-center">
                      <span
                        style={{
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          backgroundColor: event.bgColor,
                          marginRight: 8,
                          borderRadius: '2px'
                        }}
                      />
                      <div>
                        <h6 className="mb-1">{event.title}</h6>
                        <small className="text-muted">
                          <Icon icon="mdi:clock-outline" className="me-1" />
                          {dayjs(event.start).format('h:mm A')} - {dayjs(event.end).format('h:mm A')}
                        </small>
                      </div>
                    </div>
                    <span className={`badge bg-${getStatusBadgeColor(event.raw?.status)}`}>
                      {event.raw?.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">
                      <Icon icon="mdi:office-building" className="me-1" />
                      {event.branch} •
                      <Icon icon="mdi:medical-bag" className="me-1 ms-2" />
                      {event.specialization}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowMoreModal(false)}>
            <Icon icon="mdi:close" className="me-1" />
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AppointmentCalendarPage;