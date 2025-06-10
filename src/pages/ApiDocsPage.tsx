import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Copy, CheckCircle, AlertTriangle, Code, Play, Users, Calendar, Briefcase, User, RefreshCw, Database } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  user_id: string;
}

interface Specialty {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Professional {
  id: string;
  name: string;
  email: string;
  specialties: Specialty[];
}

interface CalendarData {
  calendar: {
    id: string;
    name: string;
    owner_id: string;
  };
  professionals: Professional[];
}

interface ApiData {
  user_id: string;
  calendars: CalendarData[];
  clients: Client[];
  summary: {
    total_calendars: number;
    total_professionals: number;
    total_specialties: number;
    total_clients: number;
  };
}

const ApiDocsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('documentation');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<{ [key: string]: string }>({});
  
  // Estados para a aba de IDs
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      toast.success('Código copiado!');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('Erro ao copiar código');
    }
  };

  const copyIdToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('ID copiado!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Erro ao copiar ID');
    }
  };

  const fetchApiData = async () => {
    try {
      setLoading(true);

      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from('api_keys')
        .select('user_id, client_secret')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .maybeSingle();

      if (apiKeyError || !apiKeyData) {
        throw new Error('API Key não encontrada. Configure suas credenciais primeiro.');
      }

      const credentials = btoa(`${apiKeyData.user_id}:${apiKeyData.client_secret}`);
      
      const response = await fetch('https://zqtrmtkbkdzyapdtapss.supabase.co/functions/v1/appointments?route=list-ids', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar dados');
      }

      const apiData = await response.json();
      setData(apiData);
    } catch (error) {
      console.error('Erro ao buscar dados da API:', error);
      toast.error('Erro ao carregar dados da API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'ids') {
      fetchApiData();
    }
  }, [user, activeTab]);

  const baseUrl = 'https://zqtrmtkbkdzyapdtapss.supabase.co/functions/v1/appointments';

  const endpoints = [
    {
      method: 'GET',
      path: '/list-ids',
      title: 'Listar Todos os IDs',
      description: 'Retorna todos os IDs de calendários, profissionais, especialidades e clientes vinculados ao usuário.',
      example: {
        curl: `curl -X GET "${baseUrl}/list-ids" \\
  -H "Authorization: Basic <seu-token-base64>"`,
        javascript: `const response = await fetch('${baseUrl}/list-ids', {
  method: 'GET',
  headers: {
    'Authorization': 'Basic <seu-token-base64>',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
        python: `import requests

url = "${baseUrl}/list-ids"
headers = {
    "Authorization": "Basic <seu-token-base64>",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
data = response.json()
print(data)`
      },
      response: `{
  "user_id": "user-uuid",
  "calendars": [
    {
      "calendar": {
        "id": "cal-123",
        "name": "Calendário Principal",
        "owner_id": "user-uuid"
      },
      "professionals": [
        {
          "id": "prof-456",
          "name": "Dr. João Silva",
          "email": "joao@clinica.com",
          "specialties": [
            {
              "id": "spec-789",
              "name": "Consulta Geral",
              "duration": 30,
              "price": 150.00
            }
          ]
        }
      ]
    }
  ],
  "clients": [
    {
      "id": "client-101",
      "name": "Maria Santos",
      "email": "maria@email.com",
      "phone": "(11) 99999-9999",
      "user_id": "user-uuid"
    }
  ],
  "summary": {
    "total_calendars": 1,
    "total_professionals": 1,
    "total_specialties": 1,
    "total_clients": 1
  }
}`
    },
    {
      method: 'GET',
      path: '/available-slots',
      title: 'Buscar Horários Disponíveis',
      description: 'Retorna os horários disponíveis para agendamento de um profissional em uma data específica.',
      params: [
        { name: 'professionalId', type: 'string', required: true, description: 'ID do profissional' },
        { name: 'date', type: 'string', required: true, description: 'Data no formato YYYY-MM-DD' },
        { name: 'specialtyId', type: 'string', required: true, description: 'ID da especialidade' },
      ],
      example: {
        curl: `curl -X GET "${baseUrl}/available-slots?professionalId=123&date=2025-06-10&specialtyId=456" \\
  -H "Authorization: Basic <seu-token-base64>"`,
        javascript: `const response = await fetch('${baseUrl}/available-slots?professionalId=123&date=2025-06-10&specialtyId=456', {
  method: 'GET',
  headers: {
    'Authorization': 'Basic <seu-token-base64>',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
        python: `import requests

url = "${baseUrl}/available-slots"
params = {
    "professionalId": "123",
    "date": "2025-06-10", 
    "specialtyId": "456"
}
headers = {
    "Authorization": "Basic <seu-token-base64>",
    "Content-Type": "application/json"
}

response = requests.get(url, params=params, headers=headers)
data = response.json()
print(data)`
      },
      response: `{
  "slots": [
    {
      "start": "2025-06-10T09:00:00.000Z",
      "end": "2025-06-10T09:30:00.000Z"
    },
    {
      "start": "2025-06-10T09:30:00.000Z", 
      "end": "2025-06-10T10:00:00.000Z"
    },
    {
      "start": "2025-06-10T10:00:00.000Z",
      "end": "2025-06-10T10:30:00.000Z"
    }
  ]
}`
    },
    {
      method: 'GET',
      path: '/details',
      title: 'Detalhes do Agendamento',
      description: 'Retorna informações detalhadas de um agendamento específico.',
      params: [
        { name: 'id', type: 'string', required: true, description: 'ID do agendamento' },
      ],
      example: {
        curl: `curl -X GET "${baseUrl}/details?id=appointment-uuid" \\
  -H "Authorization: Basic <seu-token-base64>"`,
        javascript: `const response = await fetch('${baseUrl}/details?id=appointment-uuid', {
  method: 'GET',
  headers: {
    'Authorization': 'Basic <seu-token-base64>',
    'Content-Type': 'application/json'
  }
});

const appointment = await response.json();
console.log(appointment);`,
        python: `import requests

url = "${baseUrl}/details"
params = {"id": "appointment-uuid"}
headers = {
    "Authorization": "Basic <seu-token-base64>",
    "Content-Type": "application/json"
}

response = requests.get(url, params=params, headers=headers)
appointment = response.json()
print(appointment)`
      },
      response: `{
  "id": "appointment-uuid",
  "professional_id": "prof-123",
  "client_id": "client-456", 
  "specialty_id": "spec-789",
  "calendar_id": "cal-101",
  "user_id": "user-202",
  "start_time": "2025-06-10T09:00:00.000Z",
  "end_time": "2025-06-10T09:30:00.000Z",
  "notes": "Consulta de rotina",
  "status": "confirmed",
  "client": {
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999"
  },
  "professional": {
    "name": "Dr. Maria Santos",
    "email": "maria@clinica.com"
  },
  "specialty": {
    "name": "Consulta Geral",
    "duration": 30,
    "price": 150.00
  }
}`
    },
    {
      method: 'POST',
      path: '/book',
      title: 'Criar Agendamento',
      description: 'Cria um novo agendamento no sistema.',
      body: `{
  "professionalId": "prof-123",
  "clientId": "client-456",
  "specialtyId": "spec-789", 
  "calendarId": "cal-101",
  "startTime": "2025-06-10T09:00:00.000Z",
  "endTime": "2025-06-10T09:30:00.000Z",
  "notes": "Consulta de rotina"
}`,
      example: {
        curl: `curl -X POST "${baseUrl}/book" \\
  -H "Authorization: Basic <seu-token-base64>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "professionalId": "prof-123",
    "clientId": "client-456", 
    "specialtyId": "spec-789",
    "calendarId": "cal-101",
    "startTime": "2025-06-10T09:00:00.000Z",
    "endTime": "2025-06-10T09:30:00.000Z",
    "notes": "Consulta de rotina"
  }'`,
        javascript: `const appointmentData = {
  professionalId: "prof-123",
  clientId: "client-456",
  specialtyId: "spec-789", 
  calendarId: "cal-101",
  startTime: "2025-06-10T09:00:00.000Z",
  endTime: "2025-06-10T09:30:00.000Z",
  notes: "Consulta de rotina"
};

const response = await fetch('${baseUrl}/book', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic <seu-token-base64>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(appointmentData)
});

const newAppointment = await response.json();
console.log(newAppointment);`,
        python: `import requests
import json

url = "${baseUrl}/book"
data = {
    "professionalId": "prof-123",
    "clientId": "client-456",
    "specialtyId": "spec-789",
    "calendarId": "cal-101", 
    "startTime": "2025-06-10T09:00:00.000Z",
    "endTime": "2025-06-10T09:30:00.000Z",
    "notes": "Consulta de rotina"
}
headers = {
    "Authorization": "Basic <seu-token-base64>",
    "Content-Type": "application/json"
}

response = requests.post(url, data=json.dumps(data), headers=headers)
new_appointment = response.json()
print(new_appointment)`
      },
      response: `{
  "id": "new-appointment-uuid",
  "professional_id": "prof-123",
  "client_id": "client-456",
  "specialty_id": "spec-789",
  "calendar_id": "cal-101",
  "user_id": "user-202", 
  "start_time": "2025-06-10T09:00:00.000Z",
  "end_time": "2025-06-10T09:30:00.000Z",
  "notes": "Consulta de rotina",
  "status": "confirmed",
  "created_at": "2025-06-09T22:06:00.000Z"
}`
    },
    {
      method: 'PUT',
      path: '/reschedule',
      title: 'Reagendar Consulta',
      description: 'Altera o horário de um agendamento existente.',
      body: `{
  "id": "appointment-uuid",
  "startTime": "2025-06-10T10:00:00.000Z",
  "endTime": "2025-06-10T10:30:00.000Z"
}`,
      example: {
        curl: `curl -X PUT "${baseUrl}/reschedule" \\
  -H "Authorization: Basic <seu-token-base64>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "id": "appointment-uuid",
    "startTime": "2025-06-10T10:00:00.000Z",
    "endTime": "2025-06-10T10:30:00.000Z"
  }'`,
        javascript: `const rescheduleData = {
  id: "appointment-uuid",
  startTime: "2025-06-10T10:00:00.000Z",
  endTime: "2025-06-10T10:30:00.000Z"
};

const response = await fetch('${baseUrl}/reschedule', {
  method: 'PUT',
  headers: {
    'Authorization': 'Basic <seu-token-base64>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(rescheduleData)
});

const updatedAppointment = await response.json();
console.log(updatedAppointment);`,
        python: `import requests
import json

url = "${baseUrl}/reschedule"
data = {
    "id": "appointment-uuid",
    "startTime": "2025-06-10T10:00:00.000Z",
    "endTime": "2025-06-10T10:30:00.000Z"
}
headers = {
    "Authorization": "Basic <seu-token-base64>",
    "Content-Type": "application/json"
}

response = requests.put(url, data=json.dumps(data), headers=headers)
updated_appointment = response.json()
print(updated_appointment)`
      },
      response: `{
  "id": "appointment-uuid",
  "professional_id": "prof-123",
  "client_id": "client-456",
  "specialty_id": "spec-789",
  "start_time": "2025-06-10T10:00:00.000Z",
  "end_time": "2025-06-10T10:30:00.000Z",
  "status": "confirmed",
  "updated_at": "2025-06-09T22:06:00.000Z"
}`
    },
    {
      method: 'PUT',
      path: '/cancel',
      title: 'Cancelar Agendamento',
      description: 'Cancela um agendamento existente.',
      body: `{
  "id": "appointment-uuid"
}`,
      example: {
        curl: `curl -X PUT "${baseUrl}/cancel" \\
  -H "Authorization: Basic <seu-token-base64>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "id": "appointment-uuid"
  }'`,
        javascript: `const cancelData = {
  id: "appointment-uuid"
};

const response = await fetch('${baseUrl}/cancel', {
  method: 'PUT',
  headers: {
    'Authorization': 'Basic <seu-token-base64>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(cancelData)
});

const cancelledAppointment = await response.json();
console.log(cancelledAppointment);`,
        python: `import requests
import json

url = "${baseUrl}/cancel"
data = {"id": "appointment-uuid"}
headers = {
    "Authorization": "Basic <seu-token-base64>",
    "Content-Type": "application/json"
}

response = requests.put(url, data=json.dumps(data), headers=headers)
cancelled_appointment = response.json()
print(cancelled_appointment)`
      },
      response: `{
  "id": "appointment-uuid",
  "professional_id": "prof-123",
  "client_id": "client-456",
  "specialty_id": "spec-789",
  "status": "canceled",
  "updated_at": "2025-06-09T22:06:00.000Z"
}`
    }
  ];

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-md">
        <span className="text-sm font-medium">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
        >
          {copiedCode === id ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span className="text-xs">{copiedCode === id ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-md overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copyIdToClipboard(text, id)}
      className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      title="Copiar ID"
    >
      {copiedId === id ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );

  const LanguageButtons = ({ examples, endpointIndex }: { examples: any; endpointIndex: number }) => {
    const currentLanguage = activeLanguage[`endpoint-${endpointIndex}`] || 'curl';
    
    return (
      <div>
        <div className="flex space-x-2 mb-4">
          {Object.keys(examples).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLanguage(prev => ({ ...prev, [`endpoint-${endpointIndex}`]: lang }))}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentLanguage === lang
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {lang === 'curl' ? 'cURL' : lang === 'javascript' ? 'JavaScript' : 'Python'}
            </button>
          ))}
        </div>
        <CodeBlock
          code={examples[currentLanguage]}
          language={currentLanguage === 'curl' ? 'bash' : currentLanguage}
          id={`${currentLanguage}-${endpointIndex}`}
        />
      </div>
    );
  };

  const renderDocumentation = () => (
    <div className="space-y-6">
      {/* Seção de Autenticação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span>Autenticação</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Todas as requisições da API devem incluir autenticação Basic Auth no header:
          </p>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Como obter seu token:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Acesse a página de <strong>Configurações do Perfil</strong></li>
              <li>2. Crie uma API Key se ainda não tiver</li>
              <li>3. Copie o token Base64 gerado</li>
              <li>4. Use no header Authorization</li>
            </ol>
          </div>

          <CodeBlock
            code={`Authorization: Basic <seu-token-base64>
Content-Type: application/json`}
            language="Headers"
            id="auth-headers"
          />

          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <p className="text-sm text-yellow-700">
              <strong>⚠️ Importante:</strong> Mantenha seu token seguro e não o compartilhe. 
              Ele dá acesso total à sua conta via API.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* URL Base */}
      <Card>
        <CardHeader>
          <CardTitle>URL Base</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-md">
            <code className="text-sm font-mono">{baseUrl}</code>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      {endpoints.map((endpoint, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${endpoint.method === 'GET' ? 'bg-green-100 text-green-700' : 
                  endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'}`}>
                {endpoint.method}
              </span>
              <code className="text-lg bg-gray-100 px-3 py-1 rounded">{endpoint.path}</code>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{endpoint.title}</h3>
              <p className="text-gray-600">{endpoint.description}</p>
            </div>

            {/* Parâmetros */}
            {endpoint.params && (
              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <Code className="w-4 h-4" />
                  <span>Parâmetros</span>
                </h4>
                <div className="bg-gray-50 rounded-md overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nome</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tipo</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Obrigatório</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {endpoint.params.map((param, i) => (
                        <tr key={i} className="border-t border-gray-200">
                          <td className="px-4 py-2 text-sm font-mono">{param.name}</td>
                          <td className="px-4 py-2 text-sm">{param.type}</td>
                          <td className="px-4 py-2 text-sm">
                            {param.required ? (
                              <span className="text-red-600 font-medium">Sim</span>
                            ) : (
                              <span className="text-gray-500">Não</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">{param.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Body da Requisição */}
            {endpoint.body && (
              <div>
                <h4 className="font-medium mb-3">Corpo da Requisição</h4>
                <CodeBlock
                  code={endpoint.body}
                  language="JSON"
                  id={`body-${index}`}
                />
              </div>
            )}

            {/* Exemplos */}
            <div>
              <h4 className="font-medium mb-3 flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Exemplos de Uso</span>
              </h4>
              
              <LanguageButtons examples={endpoint.example} endpointIndex={index} />
            </div>

            {/* Resposta */}
            <div>
              <h4 className="font-medium mb-3">Resposta de Sucesso</h4>
              <CodeBlock
                code={endpoint.response}
                language="JSON"
                id={`response-${index}`}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Códigos de Erro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Códigos de Erro</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Código</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Descrição</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Solução</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-2 text-sm font-mono">401</td>
                  <td className="px-4 py-2 text-sm">Unauthorized - Token inválido</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Verifique se o token Base64 está correto</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-2 text-sm font-mono">400</td>
                  <td className="px-4 py-2 text-sm">Bad Request - Parâmetros inválidos</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Verifique se todos os parâmetros obrigatórios foram enviados</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-2 text-sm font-mono">404</td>
                  <td className="px-4 py-2 text-sm">Not Found - Recurso não encontrado</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Verifique se o ID fornecido existe</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-2 text-sm font-mono">500</td>
                  <td className="px-4 py-2 text-sm">Internal Server Error</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Erro interno do servidor, tente novamente</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Notas Importantes */}
      <Card>
        <CardHeader>
          <CardTitle>Notas Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">📅 Formato de Datas</h4>
            <p className="text-sm text-blue-700">
              Todas as datas devem estar no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) em UTC.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">🔒 Segurança</h4>
            <p className="text-sm text-green-700">
              Todos os endpoints filtram automaticamente os dados pelo usuário autenticado. 
              Você só pode acessar seus próprios agendamentos.
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">⚡ Rate Limiting</h4>
            <p className="text-sm text-yellow-700">
              A API possui limite de requisições. Em caso de muitas requisições, você receberá erro 429.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIdsTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando dados da API...</p>
          </div>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="text-center p-8">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Dados não disponíveis</h2>
          <p className="text-gray-600 mb-4">
            Não foi possível carregar os dados da API. Verifique se você tem uma API Key configurada.
          </p>
          <Button onClick={fetchApiData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Calendários</p>
                  <p className="text-2xl font-bold text-gray-900">{data.summary.total_calendars}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Profissionais</p>
                  <p className="text-2xl font-bold text-gray-900">{data.summary.total_professionals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Briefcase className="w-8 h-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Especialidades</p>
                  <p className="text-2xl font-bold text-gray-900">{data.summary.total_specialties}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <User className="w-8 h-8 text-orange-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{data.summary.total_clients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendários e Profissionais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                Calendários e Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.calendars.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum calendário encontrado</p>
              ) : (
                <div className="space-y-4">
                  {data.calendars.map((calendarData) => (
                    <div key={calendarData.calendar.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{calendarData.calendar.name}</h3>
                        <div className="flex items-center">
                          <code className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {calendarData.calendar.id}
                          </code>
                          <CopyButton text={calendarData.calendar.id} id={`cal-${calendarData.calendar.id}`} />
                        </div>
                      </div>

                      {calendarData.professionals.length === 0 ? (
                        <p className="text-gray-500 text-sm">Nenhum profissional vinculado</p>
                      ) : (
                        <div className="space-y-3">
                          {calendarData.professionals.map((professional) => (
                            <div key={professional.id} className="bg-gray-50 rounded p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium">{professional.name}</p>
                                  <p className="text-sm text-gray-600">{professional.email}</p>
                                </div>
                                <div className="flex items-center">
                                  <code className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {professional.id}
                                  </code>
                                  <CopyButton text={professional.id} id={`prof-${professional.id}`} />
                                </div>
                              </div>

                              {professional.specialties.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-gray-700 mb-1">Especialidades:</p>
                                  <div className="space-y-1">
                                    {professional.specialties.map((specialty) => (
                                      <div key={specialty.id} className="flex items-center justify-between text-sm">
                                        <span>{specialty.name} ({specialty.duration}min - R$ {specialty.price})</span>
                                        <div className="flex items-center">
                                          <code className="text-xs bg-purple-100 text-purple-800 px-1 py-0.5 rounded">
                                            {specialty.id}
                                          </code>
                                          <CopyButton text={specialty.id} id={`spec-${specialty.id}`} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-orange-500" />
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.clients.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum cliente encontrado</p>
              ) : (
                <div className="space-y-3">
                  {data.clients.map((client) => (
                    <div key={client.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-600">{client.email}</p>
                          {client.phone && (
                            <p className="text-sm text-gray-600">{client.phone}</p>
                          )}
                        </div>
                        <div className="flex items-center">
                          <code className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            {client.id}
                          </code>
                          <CopyButton text={client.id} id={`client-${client.id}`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informações de Uso */}
        <Card>
          <CardHeader>
            <CardTitle>Como usar estes IDs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">📋 IDs para a API</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><strong>Calendar ID:</strong> Use para identificar o calendário nos agendamentos</li>
                <li><strong>Professional ID:</strong> Use para buscar horários disponíveis e criar agendamentos</li>
                <li><strong>Specialty ID:</strong> Use para especificar o tipo de consulta/serviço</li>
                <li><strong>Client ID:</strong> Use para identificar o cliente no agendamento</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">💡 Dica</h4>
              <p className="text-sm text-green-700">
                Clique no ícone de cópia ao lado de qualquer ID para copiá-lo automaticamente para sua área de transferência.
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Importante</h4>
              <p className="text-sm text-yellow-700">
                Estes IDs são únicos e específicos da sua conta. Use-os nas chamadas da API junto com seu token de autenticação.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documentação da API</h1>
            <p className="text-gray-600">
              Use nossa API REST para integrar o sistema de agendamentos com suas aplicações
            </p>
          </div>
          {activeTab === 'ids' && (
            <Button onClick={fetchApiData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('documentation')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documentation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>Documentação</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('ids')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ids'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>IDs Disponíveis</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'documentation' ? renderDocumentation() : renderIdsTab()}
    </DashboardLayout>
  );
};

export default ApiDocsPage;
