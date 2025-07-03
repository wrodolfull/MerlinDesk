import React, { useState } from 'react';
import { Video, VideoOff, Crown } from 'lucide-react';
import Button from '../ui/Button';
import { useVideoCallSettings } from '../../hooks/useVideoCallSettings';
import { useAuth } from '../../contexts/AuthContext';

interface VideoCallButtonProps {
  appointmentId: string;
  professionalId: string;
  professionalName: string;
  isProfessional?: boolean;
  onJoinCall?: () => void;
  buttonProps?: React.ComponentProps<typeof Button>;
}

const VideoCallButton: React.FC<VideoCallButtonProps> = ({
  appointmentId,
  professionalId,
  professionalName,
  isProfessional = false,
  onJoinCall,
  buttonProps = {},
}) => {
  const { user } = useAuth();
  const { settings, loading } = useVideoCallSettings(professionalId);
  const [isHovered, setIsHovered] = useState(false);

  // Check if user has PRO plan (simplified check - you may need to implement proper plan checking)
  const hasProPlan = true; // TODO: Implement proper plan checking

  const isVideoCallEnabled = settings?.videoCallEnabled && hasProPlan;
  const isDisabled = loading || !isVideoCallEnabled;

  const handleClick = () => {
    if (isDisabled) return;
    onJoinCall?.();
  };

  const getTooltipText = () => {
    if (loading) return 'Carregando...';
    if (!hasProPlan) return 'Apenas disponível no plano PRO';
    if (!settings?.videoCallEnabled) return 'Videochamada não habilitada para este profissional';
    return 'Entrar na videochamada';
  };

  return (
    <div className="relative">
      <Button
        variant={buttonProps.variant || "outline"}
        size={buttonProps.size || "sm"}
        onClick={handleClick}
        disabled={isDisabled}
        leftIcon={isVideoCallEnabled ? <Video size={16} /> : <VideoOff size={16} />}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={buttonProps.className || "flex items-center gap-2"}
        {...buttonProps}
      >
        {isVideoCallEnabled ? 'Videochamada' : 'Videochamada'}
      </Button>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg z-50 whitespace-nowrap">
          {getTooltipText()}
          {!hasProPlan && (
            <div className="flex items-center mt-1 text-xs text-yellow-300">
              <Crown size={12} className="mr-1" />
              Upgrade para PRO
            </div>
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default VideoCallButton; 