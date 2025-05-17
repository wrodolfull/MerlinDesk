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
  onEventReschedule?: (id: string, newStart: Date, newEnd: Date) => void;
}

const AppointmentCalendar = ({
  appointments,
  onDateSelect,
  onEventClick,
  onEventReschedule,
}: AppointmentCalendarProps) => {
  const events = appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.client?.name || 'New Appointment',
    start: appointment.start_time,
    end: appointment.end_time,
    extendedProps: {
      professional: appointment.professional?.name,
      specialty: appointment.specialty?.name,
      status: appointment.status,
      client: appointment.client?.name,
    },
    className: `fc-status-${appointment.status}`, // 👈 adiciona classe custom por status
  }));

  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed':
        return '#2563eb';
      case 'pending':
        return '#f59e0b';
      case 'completed':
        return '#10b981';
      case 'canceled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }

  return (
    <Card className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek'}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        allDaySlot={false}
        selectable={true}
        selectMirror={true}
        editable={true}
        eventDrop={(info) => {
          if (onEventReschedule) {
            onEventReschedule(info.event.id, info.event.start!, info.event.end!);
          }
        }}
        events={events}
        select={(info) => onDateSelect?.(info.start)}
        eventClick={(info) => onEventClick?.(info.event.id)}
        eventContent={(eventInfo) => (
          <div className="p-1 overflow-hidden text-white">
            <div className="font-semibold text-sm truncate">{eventInfo.event.title}</div>
            {eventInfo.view.type !== 'dayGridMonth' && (
              <>
                <div className="text-xs truncate">{eventInfo.event.extendedProps.professional}</div>
                <div className="text-xs truncate">{eventInfo.event.extendedProps.specialty}</div>
              </>
            )}
          </div>
        )}
        eventDidMount={(info) => {
          const { professional, specialty, client } = info.event.extendedProps;
          const tooltip = `${client} • ${professional} • ${specialty}`;
          info.el.setAttribute('title', tooltip);
        }}
        height="auto"
        nowIndicator={true}
        stickyHeaderDates={true}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '07:00',
          endTime: '21:00',
        }}
      />
    </Card>
  );
};

export default AppointmentCalendar;
