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
  const [isReady, setIsReady] = useState(false);

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
      console.log('🚀 Iniciando fetchApiData...');
      console.log('👤 User ID:', user?.id);
      
      setLoading(true);

      // 1. Verificar se temos o usuário
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      // 2. Buscar API Key com logs detalhados
      console.log('🔍 Buscando API Key...');
      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from('api_keys')
        .select('user_id, client_secret')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      console.log('🔑 Resultado da busca API Key:', {
        data: apiKeyData ? 'Encontrada' : 'Não encontrada',
        error: apiKeyError?.message || 'Nenhum erro',
        userId: apiKeyData?.user_id,
        hasSecret: !!apiKeyData?.client_secret
      });

      if (apiKeyError) {
        console.error('❌ Erro ao buscar API Key:', apiKeyError);
        throw new Error(`Erro ao buscar API Key: ${apiKeyError.message}`);
      }

      if (!apiKeyData) {
        throw new Error('API Key não encontrada. Configure suas credenciais primeiro.');
      }

      // 3. Criar credenciais com validação
      const credentials = btoa(`${apiKeyData.user_id}:${apiKeyData.client_secret}`);
      console.log('🔐 Credenciais criadas:', {
        userId: apiKeyData.user_id,
        secretLength: apiKeyData.client_secret?.length || 0,
        credentialsLength: credentials.length,
        credentialsPreview: credentials.substring(0, 20) + '...'
      });

      // 4. Preparar requisição
      const url = 'https://zqtrmtkbkdzyapdtapss.supabase.co/functions/v1/appointments?route=list-ids';
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'x-timezone': 'America/Sao_Paulo'
      };

      console.log('📋 Headers preparados:', {
        hasAuthorization: !!headers.Authorization,
        authorizationLength: headers.Authorization?.length || 0,
        authorizationPreview: headers.Authorization?.substring(0, 30) + '...',
        contentType: headers['Content-Type'],
        timezone: headers['x-timezone']
      });

      // 5. Fazer requisição
      console.log('📤 Enviando requisição para:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      console.log('📊 Response recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro da API:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const apiData = await response.json();
      console.log('✅ Dados recebidos com sucesso:', apiData);
      setData(apiData);

    } catch (error) {
      console.error('💥 Erro completo:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkReadiness = async () => {
      if (user?.id) {
        console.log('🔍 Verificando se API Key existe...');
        const { data, error } = await supabase
          .from('api_keys')
          .select('id, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();
        
        console.log('🔑 Status da API Key:', {
          exists: !!data,
          isActive: data?.is_active,
          error: error?.message
        });
        
        setIsReady(!!data);
      }
    };

    checkReadiness();
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'ids' && isReady) {
      fetchApiData();
    }
  }, [user, activeTab, isReady]);

  const baseUrl = 'https://zqtrmtkbkdzyapdtapss.supabase.co/functions/v1/appointments';

  const handleFetchData = () => {
    if (!isReady) {
      toast.error('API Key não configurada. Acesse Configurações do Perfil para criar uma.');
      return;
    }
    
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }
    
    fetchApiData();
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/list-ids',
      title: 'Listar Todos os IDs',
      description: 'Retorna todos os IDs de calendários, profissionais, especialidades e clientes vinculados ao usuário.',
      example: {
        curl: `curl -X GET "${baseUrl}?route=list-ids" \\
  -H "Authorization: Basic <seu-token-base64>"`,
        javascript: `const response = await fetch('${baseUrl}?route=list-ids', {
  method: 'GET',
  headers: {
    'Authorization': 'Basic <seu-token-base64>',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
        python: `import requests

url = "${baseUrl}?route=list-ids"
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
  "timezone": "America/Sao_Paulo",
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
  },
  "timezone_info": {
    "current_timezone": "America/Sao_Paulo",
    "note": "Todos os horários serão convertidos automaticamente entre UTC (banco) e fuso local (exibição)"
  }
}`
    },
    {
      method: 'GET',
      path: '/available-slots',
      title: 'Buscar Horários Disponíveis',
      description: 'Retorna os horários disponíveis para um profissional em uma data específica.',
      example: {
        curl: `curl -X GET "${baseUrl}?route=available-slots&professionalId=<id>&date=2025-01-20&specialtyId=<id>" \\
  -H "x-timezone: America/Sao_Paulo"`,
        javascript: `const response = await fetch('${baseUrl}?route=available-slots&professionalId=<id>&date=2025-01-20&specialtyId=<id>', {
  method: 'GET',
  headers: {
    'x-timezone': 'America/Sao_Paulo',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
        python: `import requests

url = "${baseUrl}?route=available-slots"
params = {
    "professionalId": "<id>",
    "date": "2025-01-20",
    "specialtyId": "<id>"
}
headers = {
    "x-timezone": "America/Sao_Paulo",
    "Content-Type": "application/json"
}

response = requests.get(url, params=params, headers=headers)
data = response.json()
print(data)`
      },
      response: `{
  "slots": [
    {
      "start": "2025-01-20T09:00:00",
      "end": "2025-01-20T09:30:00",
      "timezone": "America/Sao_Paulo"
    },
    {
      "start": "2025-01-20T09:30:00",
      "end": "2025-01-20T10:00:00",
      "timezone": "America/Sao_Paulo"
    }
  ],
  "timezone": "America/Sao_Paulo",
  "date": "2025-01-20"
}`
    },
    {
      method: 'POST',
      path: '/book',
      title: 'Criar Agendamento',
      description: 'Cria um novo agendamento. Pode criar um cliente automaticamente se clientData for fornecido.',
      example: {
        curl: `curl -X POST "${baseUrl}?route=book" \\
  -H "Content-Type: application/json" \\
  -H "x-timezone: America/Sao_Paulo" \\
  -d '{
    "professionalId": "<id>",
    "clientId": "<id>",
    "specialtyId": "<id>",
    "calendarId": "<id>",
    "startTime": "2025-01-20T09:00:00",
    "endTime": "2025-01-20T09:30:00",
    "notes": "Consulta de rotina"
  }'`,
        javascript: `const response = await fetch('${baseUrl}?route=book', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-timezone': 'America/Sao_Paulo'
  },
  body: JSON.stringify({
    professionalId: '<id>',
    clientId: '<id>',
    specialtyId: '<id>',
    calendarId: '<id>',
    startTime: '2025-01-20T09:00:00',
    endTime: '2025-01-20T09:30:00',
    notes: 'Consulta de rotina'
  })
});

const data = await response.json();
console.log(data);`,
        python: `import requests
import json

url = "${baseUrl}?route=book"
headers = {
    "Content-Type": "application/json",
    "x-timezone": "America/Sao_Paulo"
}
data = {
    "professionalId": "<id>",
    "clientId": "<id>",
    "specialtyId": "<id>",
    "calendarId": "<id>",
    "startTime": "2025-01-20T09:00:00",
    "endTime": "2025-01-20T09:30:00",
    "notes": "Consulta de rotina"
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result)`
      },
      response: `{
  "id": "apt-123",
  "professional_id": "<id>",
  "client_id": "<id>",
  "specialty_id": "<id>",
  "calendar_id": "<id>",
  "start_time": "2025-01-20T12:00:00Z",
  "end_time": "2025-01-20T12:30:00Z",
  "status": "confirmed",
  "notes": "Consulta de rotina",
  "start_time_local": "2025-01-20T09:00:00",
  "end_time_local": "2025-01-20T09:30:00",
  "client_created": false,
  "timezone_info": {
    "timezone": "America/Sao_Paulo",
    "utc_time": {
      "start": "2025-01-20T12:00:00Z",
      "end": "2025-01-20T12:30:00Z"
    },
    "local_time": {
      "start": "2025-01-20T09:00:00",
      "end": "2025-01-20T09:30:00"
    }
  },
  "client": {
    "name": "Maria Santos",
    "email": "maria@email.com",
    "phone": "(11) 99999-9999"
  },
  "professional": {
    "name": "Dr. João Silva",
    "email": "joao@clinica.com"
  },
  "specialty": {
    "name": "Consulta Geral",
    "duration": 30,
    "price": 150.00
  }
}`
    },
    {
      method: 'PUT',
      path: '/reschedule',
      title: 'Reagendar Agendamento',
      description: 'Altera os horários de um agendamento existente.',
      example: {
        curl: `curl -X PUT "${baseUrl}?route=reschedule" \\
  -H "Content-Type: application/json" \\
  -H "x-timezone: America/Sao_Paulo" \\
  -d '{
    "id": "<appointment-id>",
    "startTime": "2025-01-20T10:00:00",
    "endTime": "2025-01-20T10:30:00"
  }'`,
        javascript: `const response = await fetch('${baseUrl}?route=reschedule', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'x-timezone': 'America/Sao_Paulo'
  },
  body: JSON.stringify({
    id: '<appointment-id>',
    startTime: '2025-01-20T10:00:00',
    endTime: '2025-01-20T10:30:00'
  })
});

const data = await response.json();
console.log(data);`,
        python: `import requests
import json

url = "${baseUrl}?route=reschedule"
headers = {
    "Content-Type": "application/json",
    "x-timezone": "America/Sao_Paulo"
}
data = {
    "id": "<appointment-id>",
    "startTime": "2025-01-20T10:00:00",
    "endTime": "2025-01-20T10:30:00"
}

response = requests.put(url, headers=headers, json=data)
result = response.json()
print(result)`
      },
      response: `{
  "id": "apt-123",
  "professional_id": "<id>",
  "client_id": "<id>",
  "specialty_id": "<id>",
  "start_time": "2025-01-20T13:00:00Z",
  "end_time": "2025-01-20T13:30:00Z",
  "status": "confirmed",
  "start_time_local": "2025-01-20T10:00:00",
  "end_time_local": "2025-01-20T10:30:00",
  "timezone": "America/Sao_Paulo"
}`
    },
    {
      method: 'PUT',
      path: '/cancel',
      title: 'Cancelar Agendamento',
      description: 'Cancela um agendamento existente.',
      example: {
        curl: `curl -X PUT "${baseUrl}?route=cancel" \\
  -H "Content-Type: application/json" \\
  -d '{
    "id": "<appointment-id>"
  }'`,
        javascript: `const response = await fetch('${baseUrl}?route=cancel', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: '<appointment-id>'
  })
});

const data = await response.json();
console.log(data);`,
        python: `import requests
import json

url = "${baseUrl}?route=cancel"
headers = {
    "Content-Type": "application/json"
}
data = {
    "id": "<appointment-id>"
}

response = requests.put(url, headers=headers, json=data)
result = response.json()
print(result)`
      },
      response: `{
  "id": "apt-123",
  "professional_id": "<id>",
  "client_id": "<id>",
  "specialty_id": "<id>",
  "start_time": "2025-01-20T12:00:00Z",
  "end_time": "2025-01-20T12:30:00Z",
  "status": "canceled"
}`
    },
    {
      method: 'GET',
      path: '/details',
      title: 'Detalhes do Agendamento',
      description: 'Retorna os detalhes completos de um agendamento específico.',
      example: {
        curl: `curl -X GET "${baseUrl}?route=details&id=<appointment-id>" \\
  -H "x-timezone: America/Sao_Paulo"`,
        javascript: `const response = await fetch('${baseUrl}?route=details&id=<appointment-id>', {
  method: 'GET',
  headers: {
    'x-timezone': 'America/Sao_Paulo',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
        python: `import requests

url = "${baseUrl}?route=details"
params = {
    "id": "<appointment-id>"
}
headers = {
    "x-timezone": "America/Sao_Paulo",
    "Content-Type": "application/json"
}

response = requests.get(url, params=params, headers=headers)
data = response.json()
print(data)`
      },
      response: `{
  "id": "apt-123",
  "professional_id": "<id>",
  "client_id": "<id>",
  "specialty_id": "<id>",
  "start_time": "2025-01-20T12:00:00Z",
  "end_time": "2025-01-20T12:30:00Z",
  "status": "confirmed",
  "start_time_local": "2025-01-20T09:00:00",
  "end_time_local": "2025-01-20T09:30:00",
  "timezone": "America/Sao_Paulo",
  "client": {
    "name": "Maria Santos",
    "email": "maria@email.com",
    "phone": "(11) 99999-9999"
  },
  "professional": {
    "name": "Dr. João Silva",
    "email": "joao@clinica.com"
  },
  "specialty": {
    "name": "Consulta Geral",
    "duration": 30,
    "price": 150.00
  }
}`
    }
  ];

  // Adicionar seção de informações sobre timezone
  const timezoneInfo = {
    title: 'Informações sobre Fuso Horário',
    description: 'A API suporta conversão automática de fuso horário. Use o header x-timezone para especificar o fuso desejado.',
    examples: {
      curl: `curl -X GET "${baseUrl}?route=available-slots&professionalId=<id>&date=2025-01-20&specialtyId=<id>" \\
  -H "x-timezone: America/Sao_Paulo"`,
      javascript: `const response = await fetch('${baseUrl}?route=available-slots&professionalId=<id>&date=2025-01-20&specialtyId=<id>', {
  method: 'GET',
  headers: {
    'x-timezone': 'America/Sao_Paulo',
    'Content-Type': 'application/json'
  }
});`,
      python: `import requests

url = "${baseUrl}?route=available-slots"
params = {
    "professionalId": "<id>",
    "date": "2025-01-20",
    "specialtyId": "<id>"
}
headers = {
    "x-timezone": "America/Sao_Paulo",
    "Content-Type": "application/json"
}

response = requests.get(url, params=params, headers=headers)`
    }
  };

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

      {/* Informações sobre Timezone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Informações sobre Fuso Horário</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            A API suporta conversão automática de fuso horário. Use o header <code className="bg-gray-100 px-1 rounded">x-timezone</code> para especificar o fuso desejado.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">🌍 Timezone Suportado</h4>
            <p className="text-sm text-blue-700 mb-2">
              <strong>Padrão:</strong> America/Sao_Paulo (GMT-3)
            </p>
            <p className="text-sm text-blue-700">
              <strong>Conversão:</strong> Todos os horários são automaticamente convertidos entre UTC (banco de dados) e o fuso local especificado.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-3">Exemplo de Uso</h4>
            <LanguageButtons examples={timezoneInfo.examples} endpointIndex={-1} />
          </div>
        </CardContent>
      </Card>

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
              Use o formato ISO 8601 (YYYY-MM-DDTHH:mm:ss) para horários locais. A API converte automaticamente para UTC.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">🔒 Autenticação</h4>
            <p className="text-sm text-green-700">
              Use autenticação Basic com seu user_id e client_secret codificados em Base64. 
              Exemplo: <code className="bg-green-100 px-1 rounded">Authorization: Basic dXNlcjEyMzphYmNkZWY=</code>
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
            <h4 className="font-medium text-purple-800 mb-2">👤 Criação de Clientes</h4>
            <p className="text-sm text-purple-700">
              No endpoint /book, você pode criar clientes automaticamente fornecendo clientData em vez de clientId.
              Nome e telefone são obrigatórios.
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
          <Button onClick={handleFetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Indicador de Status da API Key */}
        {!isReady && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  API Key não configurada
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Configure uma API Key nas Configurações do Perfil para usar esta funcionalidade.
                </p>
              </div>
            </div>
          </div>
        )}

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
