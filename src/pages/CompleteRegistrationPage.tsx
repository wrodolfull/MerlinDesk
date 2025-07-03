import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Lock, Mail, Phone, FileText, Camera, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Spinner } from '../components/ui/Spinner';
import ImageUpload from '../components/ui/ImageUpload';
import toast from 'react-hot-toast';

const CompleteRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [professional, setProfessional] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    phone: '',
    bio: '',
    specialties: ''
  });

  // Verificar token e carregar dados do profissional
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error('Link inválido. Verifique o email recebido.');
        navigate('/login');
        return;
      }

      try {
        setVerifying(true);
        
        // Buscar profissional pelo token (ID)
        const { data, error } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', token)
          .is('auth_user_id', null)
          .single();

        if (error || !data) {
          if (error?.code === 'PGRST116') {
            toast.error('Este convite já foi utilizado ou é inválido.');
          } else {
            toast.error('Erro ao verificar convite. Tente novamente.');
          }
          navigate('/login');
          return;
        }

        setProfessional(data);
        setFormData(prev => ({
          ...prev,
          phone: data.phone || '',
          bio: data.bio || ''
        }));
        
      } catch (error) {
        console.error('Error verifying token:', error);
        toast.error('Erro ao verificar convite. Tente novamente.');
        navigate('/login');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Senha deve conter letra maiúscula, minúscula e número';
    }

    // Validar confirmação de senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    // Validar telefone (se fornecido)
    if (formData.phone && !/^[\d\s\(\)\-\+]+$/.test(formData.phone)) {
      newErrors.phone = 'Telefone inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    try {
      setLoading(true);

      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: professional.email,
        password: formData.password,
        options: {
          data: {
            role: 'professional',
            professional_id: professional.id
          }
        }
      });

      if (authError) {
        if (authError.message.includes('email')) {
          toast.error('Este email já está sendo usado. Tente fazer login.');
          navigate('/login');
        } else {
          throw authError;
        }
        return;
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // 2. Atualizar profissional com auth_user_id e dados adicionais
      const { error: updateError } = await supabase
        .from('professionals')
        .update({
          auth_user_id: authData.user.id,
          phone: formData.phone.trim() || null,
          bio: formData.bio.trim() || null,
          avatar: avatarUrl || null
        })
        .eq('id', professional.id);

      if (updateError) throw updateError;

      // 3. Criar especialidades se fornecidas
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
                professional_id: professional.id
              });

            if (!specialtyError) {
              specialtiesCreated++;
            }
          } catch (error) {
            console.error(`Error creating specialty "${specialtyName}":`, error);
          }
        }
      }

      // 4. Criar registro de permissões (será feito automaticamente pelo trigger)
      // Mas vamos garantir que existe
      const { error: accessError } = await supabase
        .from('professional_access')
        .insert({
          professional_id: professional.id,
          auth_user_id: authData.user.id,
          can_view_appointments: true,
          can_edit_appointments: false,
          can_view_calendar: true,
          can_edit_calendar: false,
          can_view_clients: true,
          can_edit_clients: false,
          can_view_specialties: true,
          can_edit_specialties: true,
          can_view_working_hours: true,
          can_edit_working_hours: true,
          can_view_video_calls: true,
          can_edit_video_calls: false,
          can_view_reports: false,
          can_edit_reports: false,
        });

      if (accessError && accessError.code !== '23505') { // Ignorar erro de duplicata
        throw accessError;
      }

      toast.success(
        `Cadastro concluído com sucesso! ${specialtiesCreated > 0 ? `${specialtiesCreated} especialidade(s) adicionada(s). ` : ''}Bem-vindo ao Merlin Desk!`,
        { duration: 5000 }
      );
      
      // Redirecionar para o dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Error completing registration:', error);
      
      if (error.message?.includes('email')) {
        toast.error('Este email já está em uso');
      } else {
        toast.error('Erro ao completar cadastro: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Verificando convite...</p>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Convite Inválido</h1>
          <p className="text-gray-600 mb-4">Este convite não é válido ou já foi utilizado.</p>
          <Button onClick={() => navigate('/login')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Ir para Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Complete seu Cadastro
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Olá, <strong>{professional.name}</strong>! Complete seu perfil para acessar o sistema.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto de Perfil */}
            <div>
              <Label>Foto de Perfil</Label>
              <div className="mt-2">
                <ImageUpload
                  currentImageUrl={avatarUrl}
                  onImageUpload={setAvatarUrl}
                  onImageRemove={() => setAvatarUrl('')}
                  size="lg"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Definir Senha
              </h3>
              
              <div>
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Deve conter pelo menos 6 caracteres, incluindo letra maiúscula, minúscula e número
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirme a senha"
                  required
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Informações Adicionais
              </h3>
              
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="bio">Biografia</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <Label htmlFor="specialties">Especialidades (separadas por vírgula)</Label>
                <Input
                  id="specialties"
                  value={formData.specialties}
                  onChange={(e) => handleInputChange('specialties', e.target.value)}
                  placeholder="Psicologia, Terapia Cognitiva, Ansiedade"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Você poderá adicionar mais especialidades depois
                </p>
              </div>
            </div>

            {/* Informações do Sistema */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                O que você poderá fazer:
              </h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✅ Gerenciar seus próprios agendamentos</li>
                <li>✅ Visualizar e editar seu calendário</li>
                <li>✅ Conectar sua conta Google Calendar</li>
                <li>✅ Conectar WhatsApp para notificações</li>
                <li>✅ Criar e gerenciar especialidades</li>
                <li>✅ Gerenciar suas próprias tarefas</li>
              </ul>
            </div>

            {/* Ações */}
            <div className="flex justify-end">
              <Button 
                type="submit"
                disabled={loading || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword || Object.keys(errors).length > 0}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                {loading ? 'Completando...' : 'Completar Cadastro'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteRegistrationPage; 