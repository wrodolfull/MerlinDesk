import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { QrCode } from 'lucide-react';

interface WhatsAppModalProps {
  onClose: () => void;
}

const WhatsAppModal = ({ onClose }: WhatsAppModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="bg-gray-100 p-8 rounded-lg mb-4">
              <QrCode className="w-48 h-48 mx-auto text-gray-400" />
              <p className="mt-4 text-gray-600">Scan this QR code with WhatsApp to connect</p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Open WhatsApp on your phone, tap Menu or Settings and select WhatsApp Web
            </p>
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppModal;