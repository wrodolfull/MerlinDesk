import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { sendCustomMessage, checkWhatsAppStatus, AppointmentNotification, sendAppointmentConfirmation } from '../../lib/whatsapp';
import toast, { Toaster } from 'react-hot-toast';

interface WhatsAppTestModalProps {
  open: boolean;
  onClose: () => void;
}

const WhatsAppTestModal: React.FC<WhatsAppTestModalProps> = ({ open, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);

  const handleSendMessage = async () => {
    if (!phoneNumber || !message) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const result = await sendCustomMessage(phoneNumber, message);
      if (result.success) {
        toast.success('Mensagem enviada com sucesso!');
        setMessage('');
      } else {
        toast.error(`Erro ao enviar mensagem: ${result.error}`);
      }
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    try {
      const result = await checkWhatsAppStatus();
      setStatus(result);
      if (result.success) {
        toast.success('Status verificado com sucesso!');
      } else {
        toast.error(`Erro ao verificar status: ${result.error}`);
      }
    } catch (error) {
      toast.error('Erro ao verificar status');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestAppointment = async () => {
    const testNotification: AppointmentNotification = {
      clientName: 'João Silva',
      clientPhone: '5511999999999',
      professionalName: 'Dr. Maria Santos',
      specialtyName: 'Consulta Médica',
      appointmentDate: '2024-01-15',
      appointmentTime: '14:30',
      duration: 60,
      notes: 'Teste de notificação WhatsApp'
    };

    setLoading(true);
    try {
      const result = await sendAppointmentConfirmation(testNotification);
      if (result.success) {
        toast.success('Notificação de agendamento enviada com sucesso!');
      } else {
        toast.error(`Erro ao enviar notificação: ${result.error}`);
      }
    } catch (error) {
      toast.error('Erro ao enviar notificação');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Toaster />
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Teste WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status da Integração */}
          <div className="space-y-2">
            <Button 
              onClick={handleCheckStatus} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Verificar Status da Integração
            </Button>
            
            {status && (
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Status:</h4>
                <div className="text-sm space-y-1">
                  <div>Token: {status.status?.whatsapp_token ? '✅' : '❌'}</div>
                  <div>Phone ID: {status.status?.whatsapp_phone_number_id ? '✅' : '❌'}</div>
                  <div>Verify Token: {status.status?.meta_verify_token ? '✅' : '❌'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Enviar Mensagem Personalizada */}
          <div className="space-y-2 border-t pt-4">
            <h4 className="font-medium">Enviar Mensagem Personalizada</h4>
            <Input
              label="Número de Telefone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="5511999999999"
              disabled={loading}
            />
            <Input
              label="Mensagem"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={loading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={loading}
              className="w-full"
            >
              Enviar Mensagem
            </Button>
          </div>

          {/* Teste de Notificação de Agendamento */}
          <div className="space-y-2 border-t pt-4">
            <h4 className="font-medium">Teste de Notificação de Agendamento</h4>
            <Button 
              onClick={handleSendTestAppointment} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Enviar Notificação de Teste
            </Button>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppTestModal; 