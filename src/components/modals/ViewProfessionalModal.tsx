import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import Button from '../ui/Button';
import { Mail, Phone, User } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { Professional } from '../../types';

interface ViewProfessionalModalProps {
  professional: Professional;
  onClose: () => void;
}

const ViewProfessionalModal: React.FC<ViewProfessionalModalProps> = ({ professional, onClose }) => {
  // Garantir que o size é válido
  const avatarSize = 'lg';
  // Garantir que src é passado corretamente
  const avatarSrc = professional.avatar || undefined;
  return (
    <Dialog open={!!professional} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalhes do Profissional
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar src={avatarSrc} alt={professional.name || ''} size={avatarSize} />
          <h2 className="text-xl font-bold text-center">{professional.name || ''}</h2>
          <div className="flex flex-col gap-2 w-full">
            {professional.email && (
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="h-4 w-4" />
                {professional.email}
              </div>
            )}
            {professional.phone && (
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="h-4 w-4" />
                {professional.phone}
              </div>
            )}
            {professional.bio && (
              <div className="text-gray-700">
                <span className="font-semibold">Bio:</span> {professional.bio}
              </div>
            )}
            {Array.isArray(professional.specialties) && professional.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {professional.specialties.map((spec) => (
                  <Badge key={spec.id} variant="secondary">{spec.name}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewProfessionalModal; 