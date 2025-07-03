import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Dialog, DialogContent } from '../ui/Dialog';
import Input from '../ui/Input';
import { Spinner } from '../ui/Spinner';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  professionalId: string;
  professionalName: string;
  clientName: string;
  isProfessional: boolean;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  professionalId,
  professionalName,
  clientName,
  isProfessional
}) => {
  const { user } = useAuth();
  const [roomName, setRoomName] = useState<string>('');
  const [participantName, setParticipantName] = useState<string>('');
  const [callStarted, setCallStarted] = useState(false);
  const [showAtaModal, setShowAtaModal] = useState(false);
  const [ataText, setAtaText] = useState('');
  const [iaSummary, setIaSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const popupRef = React.useRef<Window | null>(null);
  const monitorInterval = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && user?.id) {
      // Generate a unique room name based on appointment ID
      const uniqueRoomName = `merlindesk-${appointmentId}-${Date.now()}`;
      setRoomName(uniqueRoomName);
      // Sempre usar o nome do usuário logado (ou vazio)
      setParticipantName(user?.user_metadata?.name || '');
      setCallStarted(false);
      setShowAtaModal(false);
      setAtaText('');
      setIaSummary('');
      if (monitorInterval.current) clearInterval(monitorInterval.current);
    }
    // Limpeza ao fechar modal
    return () => {
      if (monitorInterval.current) clearInterval(monitorInterval.current);
    };
  }, [isOpen, appointmentId, user?.id, user?.user_metadata?.name]);

  const handleClose = () => {
    if (callStarted) {
      setShowAtaModal(true);
      setCallStarted(false);
    }
    onClose();
  };

  const handleOpenPopup = () => {
    const url = `https://meet.jit.si/${roomName}`;
    const ataUrl = `/ata?appointmentId=${appointmentId}`;
    window.open(
      url,
      'JitsiMeet',
      'width=900,height=700,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes'
    );
    window.open(
      ataUrl,
      'AtaPopup',
      'width=500,height=700,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes'
    );
    setCallStarted(true);
    // Não abrir mais o modal de ata local
    popupRef.current = null;
    if (monitorInterval.current) clearInterval(monitorInterval.current);
  };

  // Função para gerar resumo com IA (placeholder)
  const handleGenerateIaSummary = async () => {
    setIsGenerating(true);
    setIaSummary('');
    try {
      const response = await fetch('/functions/v1/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ataText }),
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-lg font-semibold">Videochamada</h2>
              <p className="text-sm text-gray-600">
                Sala: {roomName}
              </p>
              <p className="text-sm text-gray-600">
                {/* Exibe o nome do usuário logado ou vazio */}
                {participantName || 'Participante'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              leftIcon={<X size={20} />}
            />
          </div>

          {/* Instructions and Open Call Button */}
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-sm text-gray-700 mb-4 text-center">
              <p><strong>Como funciona:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1 text-left">
                <li>Ao clicar no botão abaixo, a videochamada será aberta em uma nova janela popup.</li>
                <li>Permita o acesso à câmera e microfone quando solicitado.</li>
                <li>Use os controles do Jitsi para gerenciar áudio e vídeo.</li>
                <li>Compartilhe o link da sala com o outro participante se necessário.</li>
              </ul>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleOpenPopup}
              className="mb-2"
              disabled={callStarted}
            >
              Abrir videochamada em popup
            </Button>
            {callStarted && (
              <div className="mt-2 text-green-600 text-sm text-center">
                A videochamada está aberta em outra janela.<br />
                Você pode retornar a esta tela a qualquer momento.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoCallModal; 