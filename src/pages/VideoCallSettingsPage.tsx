import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { useAllProfessionals } from '../hooks/useAllProfessionals';
import { useVideoCallSettings } from '../hooks/useVideoCallSettings';
import { Loader, CheckCircle, AlertCircle, Info, Copy, Video } from 'lucide-react';
import toast from 'react-hot-toast';

const VideoCallSettingsPage: React.FC = () => {
  const { professionals, loading: professionalsLoading, error: professionalsError } = useAllProfessionals();
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');
  const [videoCallEnabled, setVideoCallEnabled] = useState(false);
  const [meetingNotesEnabled, setMeetingNotesEnabled] = useState(false);
  const [sendSummaryByEmail, setSendSummaryByEmail] = useState(false);
  const [success, setSuccess] = useState(false);
  const [videoLink, setVideoLink] = useState<string>('');

  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    saving,
    saveSettings
  } = useVideoCallSettings(selectedProfessionalId);

  useEffect(() => {
    if (settings) {
      setVideoCallEnabled(settings.videoCallEnabled);
      setMeetingNotesEnabled(settings.meetingNotesEnabled);
      setSendSummaryByEmail(settings.sendSummaryByEmail);
    } else if (selectedProfessionalId) {
      setVideoCallEnabled(false);
      setMeetingNotesEnabled(false);
      setSendSummaryByEmail(false);
    }
  }, [settings, selectedProfessionalId]);

  const handleSave = async () => {
    if (!selectedProfessionalId) {
      toast.error('Selecione um profissional primeiro');
      return;
    }
    try {
      await saveSettings({
        videoCallEnabled,
        meetingNotesEnabled,
        sendSummaryByEmail,
      });
      setSuccess(true);
      toast.success('Configurações salvas com sucesso!');
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const selectedProfessional = professionals.find(p => p.id === selectedProfessionalId);

  // Gera link Jitsi único
  const handleGenerateVideoLink = () => {
    if (!selectedProfessional) return;
    const roomName = `merlindesk-${selectedProfessional.id}-${Date.now()}`;
    setVideoLink(`https://meet.jit.si/${roomName}`);
  };

  const handleCopyLink = () => {
    if (videoLink) {
      navigator.clipboard.writeText(videoLink);
      toast.success('Link copiado!');
    }
  };

  const handleOpenVideo = () => {
    if (videoLink) {
      window.open(videoLink, '_blank');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Configurações de Videochamada</span>
              <Info size={20} className="text-blue-500" />
            </CardTitle>
            <CardDescription>
              Personalize como cada profissional pode usar videochamadas e atas (resumos automáticos de reunião).<br />
              <span className="text-xs text-gray-500">Essas opções afetam a experiência do profissional e do cliente durante o atendimento online.</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {professionalsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader className="w-6 h-6 animate-spin text-primary-600" />
                <span className="ml-2 text-gray-600">Carregando profissionais...</span>
              </div>
            ) : professionalsError ? (
              <div className="flex items-center text-red-500">
                <AlertCircle className="w-5 h-5 mr-2" />
                Erro ao carregar profissionais: {professionalsError}
              </div>
            ) : professionals.length === 0 ? (
              <div className="text-center text-gray-500 py-10">Nenhum profissional cadastrado.</div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selecione um profissional:</label>
                  <div className="flex flex-wrap gap-4">
                    {professionals.map((pro) => (
                      <button
                        key={pro.id}
                        onClick={() => setSelectedProfessionalId(pro.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all shadow-sm bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/50
                          ${selectedProfessionalId === pro.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                        type="button"
                      >
                        <Avatar alt={pro.name} size="md" />
                        <span className="font-medium text-gray-900">{pro.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedProfessional && (
                  <div className="space-y-6">
                    {settingsLoading && (
                      <div className="flex items-center justify-center h-16">
                        <Loader className="w-5 h-5 animate-spin text-primary-600" />
                        <span className="ml-2 text-gray-600">Carregando configurações...</span>
                      </div>
                    )}

                    {settingsError && (
                      <div className="flex items-center text-red-500">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Erro ao carregar configurações: {settingsError}
                      </div>
                    )}

                    {!settingsLoading && !settingsError && (
                      <div className="space-y-6">
                        {/* Bloco: Videochamada */}
                        <div className="p-4 bg-blue-50 rounded-lg flex items-center justify-between border border-blue-100">
                          <div>
                            <span className="font-medium text-blue-900 flex items-center gap-1">
                              Ativar videochamada
                              <span title="Permite que o profissional realize videochamadas pelo sistema."><Info size={16} className="text-blue-400" /></span>
                            </span>
                            <p className="text-xs text-blue-700 mt-1">O profissional poderá iniciar videochamadas com clientes. O link será gerado automaticamente.</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={videoCallEnabled}
                            onChange={e => setVideoCallEnabled(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-blue-600"
                          />
                        </div>

                        {/* Bloco: ATA/Resumo */}
                        <div className={`p-4 rounded-lg flex items-center justify-between border ${videoCallEnabled ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100 opacity-60 pointer-events-none'}`}>
                          <div>
                            <span className="font-medium text-green-900 flex items-center gap-1">
                              Ativar ATA/Resumo
                              <span title="Permite gerar e salvar atas/resumos de reuniões."><Info size={16} className="text-green-400" /></span>
                            </span>
                            <p className="text-xs text-green-700 mt-1">O profissional poderá abrir uma janela de ata durante a videochamada, anotar pontos importantes e gerar um resumo automático com IA.</p>
                            <p className="text-xs text-green-600 mt-1">As atas ficam salvas no histórico do cliente e podem ser consultadas a qualquer momento.</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={meetingNotesEnabled}
                            onChange={e => setMeetingNotesEnabled(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-green-600"
                            disabled={!videoCallEnabled}
                          />
                        </div>

                        {/* Bloco: Enviar por e-mail */}
                        <div className={`p-4 rounded-lg flex items-center justify-between border ${meetingNotesEnabled ? 'bg-yellow-50 border-yellow-100' : 'bg-gray-50 border-gray-100 opacity-60 pointer-events-none'}`}>
                          <div>
                            <span className="font-medium text-yellow-900 flex items-center gap-1">
                              Enviar resumo por e-mail
                              <span title="Envia o resumo da ata automaticamente para os participantes."><Info size={16} className="text-yellow-400" /></span>
                            </span>
                            <p className="text-xs text-yellow-700 mt-1">Após a reunião, o resumo gerado será enviado automaticamente para o profissional e o cliente.</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={sendSummaryByEmail}
                            onChange={e => setSendSummaryByEmail(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-yellow-600"
                            disabled={!meetingNotesEnabled}
                          />
                        </div>

                        {/* Bloco: Iniciar videochamada de teste */}
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 flex flex-col gap-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Video size={20} className="text-purple-600" />
                            <span className="font-medium text-purple-900">Iniciar videochamada de teste</span>
                          </div>
                          <Button variant="secondary" onClick={handleGenerateVideoLink}>
                            Gerar link de videochamada
                          </Button>
                          {videoLink && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                              <input
                                type="text"
                                value={videoLink}
                                readOnly
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                              />
                              <Button variant="outline" size="sm" onClick={handleCopyLink} leftIcon={<Copy size={16} />}>
                                Copiar link
                              </Button>
                              <Button variant="primary" size="sm" onClick={handleOpenVideo} leftIcon={<Video size={16} />}>
                                Abrir videochamada
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSave}
              disabled={!selectedProfessionalId || saving || settingsLoading}
              isLoading={saving}
              variant="primary"
            >
              Salvar configurações
            </Button>
            {success && (
              <span className="flex items-center text-green-600 ml-4">
                <CheckCircle className="w-5 h-5 mr-1" /> 
                Salvo!
              </span>
            )}
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VideoCallSettingsPage; 