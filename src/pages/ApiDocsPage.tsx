import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import DashboardLayout from '../components/layout/DashboardLayout';

const ApiDocsPage = () => {
  const endpoints = [
    {
      name: 'Appointments',
      baseUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/appointments`,
      methods: [
        {
          method: 'GET',
          path: '/available-slots',
          description: 'Get available appointment slots for a professional',
          params: [
            { name: 'professionalId', type: 'string', required: true },
            { name: 'date', type: 'string', required: true, format: 'YYYY-MM-DD' },
            { name: 'specialtyId', type: 'string', required: true },
          ],
          response: `{
  "slots": [
    {
      "start": "2025-01-01T09:00:00Z",
      "end": "2025-01-01T09:30:00Z"
    }
  ]
}`,
        },
        {
          method: 'GET',
          path: '/details',
          description: 'Get detailed information about an appointment',
          params: [
            { name: 'id', type: 'string', required: true },
          ],
          response: `{
  "id": "uuid",
  "status": "confirmed",
  "startTime": "2025-01-01T09:00:00Z",
  "endTime": "2025-01-01T09:30:00Z",
  "client": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "professional": {
    "name": "Dr. Smith",
    "email": "smith@example.com"
  },
  "specialty": {
    "name": "General Checkup",
    "duration": 30,
    "price": 100
  }
}`,
        },
        {
          method: 'POST',
          path: '/book',
          description: 'Book a new appointment',
          body: `{
  "professionalId": "uuid",
  "clientId": "uuid",
  "specialtyId": "uuid",
  "startTime": "2025-01-01T09:00:00Z",
  "endTime": "2025-01-01T09:30:00Z",
  "notes": "Optional notes"
}`,
          response: `{
  "id": "uuid",
  "status": "confirmed",
  "startTime": "2025-01-01T09:00:00Z",
  "endTime": "2025-01-01T09:30:00Z"
}`,
        },
        {
          method: 'PUT',
          path: '/reschedule',
          description: 'Reschedule an existing appointment',
          body: `{
  "id": "uuid",
  "startTime": "2025-01-01T10:00:00Z",
  "endTime": "2025-01-01T10:30:00Z"
}`,
          response: `{
  "id": "uuid",
  "status": "confirmed",
  "startTime": "2025-01-01T10:00:00Z",
  "endTime": "2025-01-01T10:30:00Z"
}`,
        },
        {
          method: 'PUT',
          path: '/cancel',
          description: 'Cancel an appointment',
          body: `{
  "id": "uuid"
}`,
          response: `{
  "id": "uuid",
  "status": "canceled"
}`,
        },
      ],
    },
    {
      name: 'Calendar',
      baseUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendar`,
      methods: [
        {
          method: 'GET',
          path: '/:calendarId/schedule',
          description: 'Get the schedule for a specific calendar',
          params: [
            { name: 'calendarId', type: 'string', required: true },
            { name: 'startDate', type: 'string', required: true },
            { name: 'endDate', type: 'string', required: true },
          ],
          response: `{
  "schedule": [
    {
      "date": "2025-01-01",
      "professionals": [
        {
          "id": "uuid",
          "name": "John Doe",
          "appointments": []
        }
      ]
    }
  ]
}`,
        },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
        <p className="text-gray-600">
          Use our REST APIs to integrate AppointEase with your applications
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            All API requests must include the following headers:
          </p>
          <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
            <p>Authorization: Bearer {'{your-supabase-anon-key}'}</p>
            <p>Content-Type: application/json</p>
          </div>
        </CardContent>
      </Card>

      {endpoints.map((endpoint) => (
        <Card key={endpoint.name} className="mb-6">
          <CardHeader>
            <CardTitle>{endpoint.name} API</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Base URL: <code className="text-sm bg-gray-100 px-2 py-1 rounded">{endpoint.baseUrl}</code></p>
            
            {endpoint.methods.map((method, index) => (
              <div key={index} className="mb-8 last:mb-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium
                    ${method.method === 'GET' ? 'bg-green-100 text-green-700' : 
                      method.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                      method.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'}`}>
                    {method.method}
                  </span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{method.path}</code>
                </div>
                
                <p className="text-gray-600 mb-4">{method.description}</p>
                
                {method.params && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Parameters</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="text-left text-sm font-medium text-gray-500">Name</th>
                            <th className="text-left text-sm font-medium text-gray-500">Type</th>
                            <th className="text-left text-sm font-medium text-gray-500">Required</th>
                          </tr>
                        </thead>
                        <tbody>
                          {method.params.map((param, i) => (
                            <tr key={i}>
                              <td className="text-sm py-2">{param.name}</td>
                              <td className="text-sm py-2">{param.type}</td>
                              <td className="text-sm py-2">{param.required ? 'Yes' : 'No'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {method.body && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Request Body</h4>
                    <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                      <code>{method.body}</code>
                    </pre>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Response</h4>
                  <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                    <code>{method.response}</code>
                  </pre>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </DashboardLayout>
  );
};

export default ApiDocsPage;