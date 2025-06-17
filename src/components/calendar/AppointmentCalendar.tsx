import React, { useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
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
  
  // Injeta os estilos CSS customizados
  useEffect(() => {
    const styleId = 'fullcalendar-custom-styles';
    
    // Remove estilos existentes se houver
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Cria novo elemento de estilo
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Espaçamento dos botões do header */
      .fc-toolbar {
        margin-bottom: 1.5rem !important;
        gap: 0.75rem;
      }
      
      .fc-toolbar-chunk {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      
      .fc-button-group {
        gap: 0.25rem;
      }
      
      .fc-button {
        margin: 0 0.125rem !important;
        padding: 0.5rem 1rem !important;
        border-radius: 0.375rem !important;
        font-weight: 500 !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
      }
      
      .fc-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
      }
      
      .fc-button-primary {
        background-color: #3b82f6 !important;
        border-color: #3b82f6 !important;
      }
      
      .fc-button-primary:not(:disabled):active,
      .fc-button-primary:not(:disabled).fc-button-active {
        background-color: #1d4ed8 !important;
        border-color: #1d4ed8 !important;
      }
      
      /* Melhorias nos eventos */
      .fc-event {
        border-radius: 0.25rem !important;
        border: none !important;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }
      
      .fc-event:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
      }
      
      /* Melhorias na grid */
      .fc-timegrid-slot {
        height: 3rem !important;
      }
      
      .fc-timegrid-slot-minor {
        border-top: 1px solid #f3f4f6 !important;
      }
      
      .fc-timegrid-slot-major {
        border-top: 1px solid #e5e7eb !important;
      }
      
      /* Header do calendário */
      .fc-toolbar-title {
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        color: #1f2937 !important;
      }
      
      /* Dias da semana */
      .fc-col-header-cell {
        padding: 0.75rem 0.5rem !important;
        background-color: #f9fafb !important;
        border-bottom: 2px solid #e5e7eb !important;
        font-weight: 600 !important;
        color: #374151 !important;
      }
      
      /* Indicador de hoje */
      .fc-timegrid-now-indicator-line {
        border-color: #ef4444 !important;
        border-width: 2px !important;
      }
      
      /* Responsividade */
      @media (max-width: 768px) {
        .fc-toolbar {
          flex-direction: column;
          gap: 1rem;
        }
        
        .fc-toolbar-chunk {
          justify-content: center;
        }
        
        .fc-button {
          padding: 0.375rem 0.75rem !important;
          font-size: 0.875rem !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Cleanup: remove o estilo quando o componente for desmontado
    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);

  const events = appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.client?.name || 'Novo Agendamento',
    start: appointment.start_time,
    end: appointment.end_time,
    backgroundColor: getStatusColor(appointment.status),
    borderColor: getStatusColor(appointment.status),
    textColor: '#ffffff',
    extendedProps: {
      professional: appointment.professional?.name,
      specialty: appointment.specialty?.name,
      status: appointment.status,
      client: appointment.client?.name,
    },
    className: `fc-status-${appointment.status}`,
  }));

  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed':
        return '#2563eb'; // Azul
      case 'pending':
        return '#f59e0b'; // Amarelo
      case 'completed':
        return '#10b981'; // Verde
      case 'canceled':
        return '#ef4444'; // Vermelho
      default:
        return '#6b7280'; // Cinza
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'completed':
        return 'Concluído';
      case 'canceled':
        return 'Cancelado';
      default:
        return 'Indefinido';
    }
  }

  return (
    <Card className="p-6 shadow-lg">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        locale={ptBrLocale}
        initialView={window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek'}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: window.innerWidth < 768 
            ? 'timeGridDay,timeGridWeek,listWeek' 
            : 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
          list: 'Lista',
          prev: '‹',
          next: '›',
        }}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        slotDuration="00:30:00"
        slotLabelInterval="01:00:00"
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        allDaySlot={false}
        selectable={true}
        selectMirror={true}
        editable={true}
        droppable={true}
        eventDurationEditable={true}
        eventStartEditable={true}
        eventResizableFromStart={true}
        eventDrop={(info) => {
          if (onEventReschedule) {
            onEventReschedule(info.event.id, info.event.start!, info.event.end!);
          }
        }}
        eventResize={(info) => {
          if (onEventReschedule) {
            onEventReschedule(info.event.id, info.event.start!, info.event.end!);
          }
        }}
        events={events}
        select={(info) => {
          onDateSelect?.(info.start);
          info.view.calendar.unselect();
        }}
        eventClick={(info) => {
          onEventClick?.(info.event.id);
          info.jsEvent.preventDefault();
        }}
        eventContent={(eventInfo) => {
          const { professional, specialty, status } = eventInfo.event.extendedProps;
          const isMonthView = eventInfo.view.type === 'dayGridMonth';
          
          return (
            <div className="p-2 overflow-hidden text-white h-full">
              <div className="font-semibold text-sm truncate mb-1">
                {eventInfo.event.title}
              </div>
              {!isMonthView && (
                <>
                  {professional && (
                    <div className="text-xs truncate opacity-90 mb-0.5">
                      👨‍⚕️ {professional}
                    </div>
                  )}
                  {specialty && (
                    <div className="text-xs truncate opacity-90 mb-0.5">
                      🏥 {specialty}
                    </div>
                  )}
                  <div className="text-xs truncate opacity-75">
                    📋 {getStatusLabel(status)}
                  </div>
                </>
              )}
            </div>
          );
        }}
        eventDidMount={(info) => {
          const { professional, specialty, client, status } = info.event.extendedProps;
          const startTime = info.event.start?.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          const endTime = info.event.end?.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          const tooltip = [
            `👤 Cliente: ${client}`,
            `👨‍⚕️ Profissional: ${professional}`,
            `🏥 Especialidade: ${specialty}`,
            `📋 Status: ${getStatusLabel(status)}`,
            `🕐 Horário: ${startTime} - ${endTime}`
          ].join('\n');
          
          info.el.setAttribute('title', tooltip);
        }}
        height="auto"
        contentHeight="auto"
        aspectRatio={1.8}
        nowIndicator={true}
        stickyHeaderDates={true}
        scrollTime="08:00:00"
        businessHours={{
          daysOfWeek: [0,1,2,3,4,5,6],
          startTime: '05:00',
          endTime: '23:59',
        }}
        weekends={true}
        //dayMaxEvents={3}
        moreLinkText="mais"
        //eventMaxStack={3}
        selectConstraint="businessHours"
        eventConstraint="businessHours"
      />
    </Card>
  );
};

export default AppointmentCalendar;
