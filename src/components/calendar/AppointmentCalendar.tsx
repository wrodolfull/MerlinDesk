import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Appointment } from '../../types';
import { Card } from '../ui/Card';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (appointmentId: string) => void;
}

const AppointmentCalendar = ({ 
  appointments, 
  onDateSelect, 
  onEventClick 
}: AppointmentCalendarProps) => {
  // Format appointments for the calendar
  const events = appointments.map(appointment => ({
    id: appointment.id,
    title: appointment.client?.name || 'New Appointment',
    start: appointment.start_time,
    end: appointment.end_time,
    backgroundColor: getStatusColor(appointment.status),
    borderColor: getStatusColor(appointment.status),
    extendedProps: {
      professional: appointment.professional?.name,
      specialty: appointment.specialty?.name,
      status: appointment.status,
      client: appointment.client?.name,
    }
  }));

  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed':
        return '#2563eb'; // primary-600
      case 'pending':
        return '#f59e0b'; // warning-500
      case 'completed':
        return '#10b981'; // success-500
      case 'canceled':
        return '#ef4444'; // error-500
      default:
        return '#6b7280'; // gray-500
    }
  }

  return (
    <Card className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        select={(info) => onDateSelect?.(info.start)}
        eventClick={(info) => onEventClick?.(info.event.id)}
        eventContent={(eventInfo) => (
          <div className="p-1 overflow-hidden">
            <div className="font-semibold text-sm truncate">
              {eventInfo.event.title}
            </div>
            {eventInfo.view.type !== 'dayGridMonth' && (
              <>
                <div className="text-xs truncate">
                  {eventInfo.event.extendedProps.professional}
                </div>
                <div className="text-xs truncate">
                  {eventInfo.event.extendedProps.specialty}
                </div>
              </>
            )}
          </div>
        )}
        height="auto"
        stickyHeaderDates={true}
        nowIndicator={true}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '09:00',
          endTime: '17:00'
        }}
      />
    </Card>
  );
};

export default AppointmentCalendar;