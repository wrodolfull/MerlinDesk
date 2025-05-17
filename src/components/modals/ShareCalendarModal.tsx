import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Calendar } from '../../types';
import { Copy, Share2, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface ShareCalendarModalProps {
  calendar: Calendar;
  onClose: () => void;
}

const ShareCalendarModal: React.FC<ShareCalendarModalProps> = ({ calendar, onClose }) => {
  const bookingUrl = `${window.location.origin}/booking/${calendar.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      toast.success('Link copiado para a área de transferência');
    } catch (err) {
      console.error('Falha ao copiar:', err);
      toast.error('Erro ao copiar o link');
    }
  };

  const shareToWhatsApp = () => {
    const message = encodeURIComponent(`Agende um horário com ${calendar.name}: ${bookingUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');
    toast('Abrindo WhatsApp...', { icon: '📤' });
  };

  const copyAndShare = async () => {
    await copyToClipboard();
    shareToWhatsApp();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
    >
      <Toaster />
      <Card className="w-full max-w-sm sm:max-w-md rounded-xl shadow-xl bg-white">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Compartilhar agenda</CardTitle>
          <button onClick={onClose} aria-label="Fechar">
            <X className="w-5 h-5 text-gray-500 hover:text-red-500" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link de agendamento</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={bookingUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onFocus={(e) => e.target.select()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  leftIcon={<Copy size={14} />}
                >
                  Copiar
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={shareToWhatsApp}
                leftIcon={<Share2 size={14} />}
              >
                WhatsApp
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={copyAndShare}
                leftIcon={<Copy size={14} />}
              >
                Copiar & Enviar
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareCalendarModal;
