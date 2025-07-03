import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function getQueryParam(param: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const AtaPage: React.FC = () => {
  const appointmentId = getQueryParam('appointmentId');
  const [ataContent, setAtaContent] = useState('');
  const [iaSummary, setIaSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string>('');
  const { user } = useAuth();

  const handleGenerateIaSummary = async () => {
    if (!ataContent.trim()) return;

    setIsGenerating(true);
    setIaSummary('');
    try {
      const response = await fetch('https://zqtrmtkbkdzyapdtapss.supabase.co/functions/v1/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ataContent }),
      });
      const data = await response.json();
      if (data.summary) {
        setIaSummary(data.summary);
      } else {
        setIaSummary('Erro ao gerar resumo.');
      }
    } catch (err) {
      setIaSummary('Erro ao conectar com o serviço de IA.');
    }
    setIsGenerating(false);
  };

  const handleSaveAta = async () => {
    if (!appointmentId || !user || !ataContent.trim()) return;
    
    setIsSaving(true);
    setSuccess(false);
    setEmailStatus('');
    
    try {
      const { error: saveError } = await supabase
        .from('meeting_notes')
        .insert({
          appointment_id: appointmentId,
          user_id: user.id,
          content: ataContent,
          summary: iaSummary,
        });

      if (saveError) {
        throw new Error('Erro ao salvar ata: ' + saveError.message);
      }

      // Enviar email automaticamente
      try {
        const response = await fetch('https://zqtrmtkbkdzyapdtapss.supabase.co/functions/v1/send-meeting-notes', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            appointmentId: appointmentId,
            content: ataContent,
            summary: iaSummary,
          }),
        });

        const emailResult = await response.json();
        
        if (emailResult.success) {
          if (emailResult.emailSent) {
            setEmailStatus(`ATA enviada por email para ${emailResult.recipients} destinatário(s)`);
          } else {
            setEmailStatus('Envio de email desabilitado para este profissional');
          }
        } else {
          setEmailStatus('ATA salva, mas erro ao enviar email: ' + emailResult.error);
        }
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        setEmailStatus('ATA salva, mas erro ao enviar email');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEmailStatus('');
      }, 5000);
      
    } catch (error) {
      console.error('Erro ao salvar ATA:', error);
      alert('Erro ao salvar ata: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        
        {/* Conteúdo da ATA */}
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
              ATA DE VIDEOCHAMADA
            </h1>
            <div className="text-center text-sm text-gray-600 mb-4">
              ID do Agendamento: {appointmentId}
            </div>
          </div>

          {/* Conteúdo editável da ATA */}
          <div className="mb-6">
            <textarea
              className="w-full border border-gray-300 rounded-md p-4 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={25}
              value={ataContent}
              onChange={(e) => setAtaContent(e.target.value)}
              style={{ minHeight: '600px' }}
            />
          </div>

          {/* Resumo IA */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Resumo Automático</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleGenerateIaSummary}
                disabled={!ataContent.trim() || isGenerating}
              >
                {isGenerating ? <Spinner size="sm" /> : 'Gerar com IA'}
              </Button>
            </div>
            {iaSummary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Resumo Inteligente:</h4>
                <p className="text-blue-800 text-sm leading-relaxed">{iaSummary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="bg-gray-50 px-8 py-4 border-t">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex gap-2">
              <Button 
                variant="primary" 
                onClick={handleSaveAta} 
                disabled={!ataContent.trim() || isSaving}
              >
                {isSaving ? <Spinner size="sm" /> : 'Salvar ATA'}
              </Button>
            </div>
            <Button variant="ghost" onClick={handleClose}>
              Fechar
            </Button>
          </div>
          
          {/* Status Messages */}
          {success && (
            <div className="text-green-600 text-sm mt-3 flex items-center">
              ATA salva com sucesso!
            </div>
          )}
          {emailStatus && (
            <div className={`text-sm mt-3 flex items-center ${
              emailStatus.includes('enviada') ? 'text-green-600' : 
              emailStatus.includes('desabilitado') ? 'text-blue-600' : 
              'text-yellow-600'
            }`}>
              {emailStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AtaPage;
