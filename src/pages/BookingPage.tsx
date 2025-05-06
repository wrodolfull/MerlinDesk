import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import BookingSteps from '../components/booking/BookingSteps';
import { calendars } from '../data/mockData';

const BookingPage = () => {
  const { calendarId } = useParams<{ calendarId: string }>();
  
  // Find the calendar
  const calendar = calendars.find((c) => c.id === calendarId);
  
  if (!calendar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Calendar Not Found</h2>
            <p className="text-gray-600">
              The calendar you're looking for doesn't exist or may have been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle>{calendar.name} - Book an Appointment</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <BookingSteps calendarId={calendarId || ''} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;