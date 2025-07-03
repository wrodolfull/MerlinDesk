import React, { useState } from 'react';
import { Mail, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Label } from '../ui/Label';
import { Spinner } from '../ui/Spinner';
import toast from 'react-hot-toast';

interface InviteProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const InviteProfessionalModal: React.FC<InviteProfessionalModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    specialties: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Telefone inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setValidating(true);

    try {
      // 1. Verificar se o email já existe
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userExists = existingUser.users.some(user => 
        user.email?.toLowerCase() === formData.email.toLowerCase().trim()
      );

      if (userExists) {
        toast.error('Este email já está cadastrado no sistema');
        setErrors(prev => ({ ...prev, email: 'Email já cadastrado' }));
        return;
      }

      // 2. Verificar se já existe um profissional com este email
      const { data: existingProfessional } = await supabase
        .from('professionals')
        .select('id')
        .eq('email', formData.email.toLowerCase().trim())
        .single();

      if (existingProfessional) {
        toast.error('Já existe um profissional com este email');
        setErrors(prev => ({ ...prev, email: 'Profissional já existe' }));
        return;
      }

      setValidating(false);

      // 3. Criar o profissional
      const { data: professional, error: professionalError } = await supabase
        .from('professionals')
        .insert({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim() || null,
          bio: formData.bio.trim() || null,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (professionalError) throw professionalError;

      // 4. Criar especialidades se fornecidas
      let specialtiesCreated = 0;
      if (formData.specialties.trim()) {
        const specialtiesList = formData.specialties
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        for (const specialtyName of specialtiesList) {
          try {
            const { error: specialtyError } = await supabase
              .from('specialties')
              .insert({
                name: specialtyName,
                professional_id: professional.id,
                user_id: (await supabase.auth.getUser()).data.user?.id
              });

            if (!specialtyError) {
              specialtiesCreated++;
            }
          } catch (error) {
            console.error(`Error creating specialty "${specialtyName}":`, error);
          }
        }
      }

      // 5. Enviar email de convite
      const { error: emailError } = await supabase.functions.invoke('send-professional-invite', {
        body: {
          email: formData.email.toLowerCase().trim(),
          professionalName: formData.name.trim(),
          professionalId: professional.id,
          inviteType: 'complete_registration',
          loginUrl: `${window.location.origin}/complete-registration?token=${professional.id}`
        }
      });

      if (emailError) {
        console.error('Error sending invite email:', emailError);
        
        // Mostrar o link de convite diretamente para o usuário copiar
        const inviteUrl = `${window.location.origin}/complete-registration?token=${professional.id}`;
        
        toast.error(
          `Profissional convidado com sucesso! ${specialtiesCreated > 0 ? `${specialtiesCreated} especialidade(s) criada(s). ` : ''}Email não foi enviado. Copie este link e envie manualmente: ${inviteUrl}`,
          { duration: 10000 }
        );
        
        // Copiar o link para a área de transferência
        try {
          await navigator.clipboard.writeText(inviteUrl);
          toast.success('Link copiado para a área de transferência!');
        } catch (clipboardError) {
          console.error('Error copying to clipboard:', clipboardError);
        }
      } else {
        toast.success(
          `Profissional convidado com sucesso! ${specialtiesCreated > 0 ? `${specialtiesCreated} especialidade(s) criada(s). ` : ''}Convite enviado para ${formData.email}`,
          { duration: 5000 }
        );
      }
      
      // Limpar formulário
      setFormData({
        name: '',
        email: '',
        phone: '',
        bio: '',
        specialties: ''
      });
      setErrors({});
      
      onSuccess?.();
      onClose();
      
    } catch (error: any) {
      console.error('Error inviting professional:', error);
      
      if (error.message?.includes('email')) {
        toast.error('Este email já está em uso');
        setErrors(prev => ({ ...prev, email: 'Email já está em uso' }));
      } else {
        toast.error('Erro ao convidar profissional: ' + error.message);
      }
    } finally {
      setLoading(false);
      setValidating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Convidar Profissional
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nome do profissional"
              error={errors.name}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@exemplo.com"
              error={errors.email}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
              error={errors.phone}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="bio">Biografia</Label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Breve descrição do profissional..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="specialties">Especialidades</Label>
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={(e) => handleInputChange('specialties', e.target.value)}
              placeholder="Especialidade 1, Especialidade 2, Especialidade 3"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Separe as especialidades por vírgula
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Como funciona o convite:</p>
                <ul className="mt-1 space-y-1">
                  <li>• O profissional receberá um email com link para cadastro</li>
                  <li>• Ele definirá sua própria senha</li>
                  <li>• Terá acesso apenas aos seus próprios dados</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={loading || validating || !formData.name || !formData.email || Object.keys(errors).length > 0}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {loading ? 'Convidando...' : 'Enviar Convite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteProfessionalModal; 