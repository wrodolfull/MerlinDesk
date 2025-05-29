// src/pages/WhatsAppConnect.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const WhatsAppConnect: React.FC = () => {
  const [accessToken, setAccessToken] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    const user = await supabase.auth.getUser();
    const jwt = (await supabase.auth.getSession()).data.session?.access_token;

    try {
      const res = await fetch('http://localhost:3001/api/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          access_token: accessToken,
          phone_number_id: phoneNumberId,
          waba_id: wabaId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Número conectado com sucesso!');
      } else {
        toast.error(data.error || 'Erro na conexão');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Conectar Número do WhatsApp</h1>
      <input
        type="text"
        placeholder="Access Token da Meta"
        className="w-full border p-2 rounded mb-2"
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
      />
      <input
        type="text"
        placeholder="Phone Number ID"
        className="w-full border p-2 rounded mb-2"
        value={phoneNumberId}
        onChange={(e) => setPhoneNumberId(e.target.value)}
      />
      <input
        type="text"
        placeholder="WABA ID (Business Account)"
        className="w-full border p-2 rounded mb-4"
        value={wabaId}
        onChange={(e) => setWabaId(e.target.value)}
      />
      <button
        className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleConnect}
        disabled={loading}
      >
        {loading ? 'Conectando...' : 'Conectar'}
      </button>
    </div>
  );
};

export default WhatsAppConnect;
