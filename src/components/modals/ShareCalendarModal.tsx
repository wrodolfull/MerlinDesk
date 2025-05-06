import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Calendar } from '../../types';
import { Copy, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareCalendarModalProps {
  calendar: Calendar;
  onClose: () => void;
}

const ShareCalendarModal = ({ calendar, onClose }: ShareCalendarModalProps) => {
  const bookingUrl = `${window.location.origin}/booking/${calendar.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      toast.success('Booking link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    }
  };

  const shareToWhatsApp = () => {
    const message = encodeURIComponent(`Book an appointment with ${calendar.name}: ${bookingUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Share Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={bookingUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  leftIcon={<Copy size={14} />}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={shareToWhatsApp}
                leftIcon={<Share2 size={14} />}
              >
                Share on WhatsApp
              </Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareCalendarModal;