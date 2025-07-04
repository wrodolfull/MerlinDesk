import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Calendar } from '../../types';
import { ClipboardCopy, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';
import { FaWhatsapp, FaInstagram, FaLinkedin, FaFacebookF, FaQrcode } from 'react-icons/fa';

interface ShareCalendarModalProps {
  calendar: Calendar;
  onClose: () => void;
}

const ShareCalendarModal: React.FC<ShareCalendarModalProps> = ({ calendar, onClose }) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const bookingUrl = `${window.location.origin}/booking/${calendar.id}`;
  const embedCode = `<iframe src="${window.location.origin}/booking/embed/${calendar.id}" width="100%" height="700" frameborder="0" style="border:none;"></iframe>`;

  const copyToClipboard = async (text: string, successMsg = 'Copiado!') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMsg);
    } catch (err) {
      console.error('Falha ao copiar:', err);
      toast.error('Erro ao copiar');
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('calendar-qrcode') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${calendar.name || 'calendario'}.png`;
      a.click();
    }
  };

  const socialLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent('Agende comigo: ' + bookingUrl)}`,
    instagram: `https://www.instagram.com/?url=${encodeURIComponent(bookingUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(bookingUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(bookingUrl)}`,
  };

  const socialIcons = {
    whatsapp: <FaWhatsapp size={28} className="text-[#25D366]" />,
    instagram: <FaInstagram size={28} className="text-[#E1306C]" />,
    linkedin: <FaLinkedin size={28} className="text-[#0077B5]" />,
    facebook: <FaFacebookF size={28} className="text-[#1877F3]" />,
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
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button
                onClick={() => copyToClipboard(embedCode, 'Código de incorporação copiado!')}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 rounded-md px-4 py-2 text-sm"
              >
                <ClipboardCopy size={16} className="text-gray-600" />
                Incorporar no site
              </Button>
              <Button
                className="bg-[#7C45D0] hover:bg-[#6D3FC4] text-white w-full"
                onClick={() => copyToClipboard(bookingUrl, 'Link copiado!')}
                leftIcon={<ClipboardCopy size={16} />}
              >
                Copiar
              </Button>
              
              <div className="flex gap-4 justify-center pt-4">
                {Object.entries(socialIcons).map(([key, icon]) => (
                  <a
                    key={key}
                    href={socialLinks[key as keyof typeof socialLinks]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                    title={`Compartilhar no ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                  >
                    {icon}
                  </a>
                ))}
                <button
                  onClick={() => setShowQRCode(s => !s)}
                  className="hover:scale-110 transition-transform"
                  title="Mostrar/ocultar QRCode"
                >
                  <FaQrcode size={28} className="text-gray-600" />
                </button>
              </div>
              
              {showQRCode && (
                <div className="mt-4 flex flex-col items-center animate-fade-in">
                  <QRCodeCanvas
                    id="calendar-qrcode"
                    value={bookingUrl}
                    size={150}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                  <Button variant="outline" size="sm" className="mt-4" onClick={downloadQRCode}>
                    Baixar QRCode
                  </Button>
                </div>
              )}

              <Button variant="ghost" onClick={onClose} className="w-full">
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
