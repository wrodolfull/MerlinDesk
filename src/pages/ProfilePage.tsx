import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader, AlertTriangle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>();

  const newPassword = watch('newPassword');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user) return;

        // Carregar dados do usuário autenticado
        reset({
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
        });
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        toast.error('Falha ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setUpdating(true);

      // Preparar dados para atualização
      const updateData: any = {
        data: {
          full_name: data.name,
          name: data.name,
          phone: data.phone, // Armazenar telefone nos metadados
        }
      };

      // 1. Atualizar email se foi alterado
      if (data.email !== user?.email) {
        updateData.email = data.email;
        toast.success('Um email de confirmação foi enviado para o novo endereço');
      }

      // 2. Atualizar senha se fornecida
      if (data.currentPassword && data.newPassword) {
        // Verificar senha atual fazendo login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user?.email || '',
          password: data.currentPassword,
        });

        if (signInError) {
          toast.error('Senha atual incorreta');
          return;
        }

        updateData.password = data.newPassword;
        toast.success('Senha atualizada com sucesso');
      }

      // 3. Atualizar dados do usuário (sem telefone no campo principal)
      const { error: updateError } = await supabase.auth.updateUser(updateData);

      if (updateError) throw updateError;

      toast.success('Perfil atualizado com sucesso');
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error.message || 'Falha ao atualizar perfil');
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setDeleteConfirmText('');
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText('');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETAR') {
      return;
    }

    try {
      setIsDeleting(true);
      
      // 1. Fazer logout primeiro
      await signOut();
      
      // 2. Tentar excluir a conta de autenticação
      try {
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
          user?.id as string
        );
        
        if (authDeleteError) {
          console.warn('Não foi possível excluir a conta automaticamente:', authDeleteError);
          toast.success('Sua conta foi desativada. Entre em contato com o suporte para exclusão completa.');
        } else {
          toast.success('Sua conta foi deletada com sucesso');
        }
      } catch (adminError) {
        console.warn('Função admin não disponível:', adminError);
        toast.success('Sua conta foi desativada. Entre em contato com o suporte para exclusão completa.');
      }
      
      navigate('/login');
    } catch (error: any) {
      console.error('Erro ao deletar conta:', error);
      toast.error('Falha ao deletar conta. Entre em contato com o suporte.');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Perfil</h1>
        <p className="text-gray-600">Gerencie as informações da sua conta</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nome Completo"
                {...register('name', { required: 'Nome é obrigatório' })}
                error={errors.name?.message}
              />

              <Input
                label="Email"
                type="email"
                {...register('email', { 
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                error={errors.email?.message}
              />

              <Input
                label="Telefone"
                {...register('phone', {
                  pattern: {
                    value: /^[\d\s\(\)\-\+]+$/,
                    message: 'Formato de telefone inválido'
                  }
                })}
                error={errors.phone?.message}
                placeholder="(11) 99999-9999"
              />

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
                
                <Input
                  type="password"
                  label="Senha Atual"
                  {...register('currentPassword', {
                    validate: (value) => {
                      const newPass = watch('newPassword');
                      if (newPass && !value) {
                        return 'Senha atual é obrigatória para alterar a senha';
                      }
                      return true;
                    }
                  })}
                  error={errors.currentPassword?.message}
                />

                <Input
                  type="password"
                  label="Nova Senha"
                  {...register('newPassword', {
                    minLength: {
                      value: 8,
                      message: 'A senha deve ter pelo menos 8 caracteres',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'A senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
                    }
                  })}
                  error={errors.newPassword?.message}
                />

                <Input
                  type="password"
                  label="Confirmar Nova Senha"
                  {...register('confirmPassword', {
                    validate: value =>
                      !newPassword || value === newPassword || 'As senhas não coincidem',
                  })}
                  error={errors.confirmPassword?.message}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={updating}>
                  {updating ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Seção para deletar conta */}
        <Card className="border-red-200">
          <CardHeader className="border-b border-red-100 bg-red-50">
            <CardTitle className="text-red-700 flex items-center">
              <AlertTriangle className="mr-2" size={20} />
              Deletar Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-4">
              Uma vez que você deletar sua conta, não há como voltar atrás. Por favor, tenha certeza.
            </p>
            <Button 
              variant="primary" 
              className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
              onClick={openDeleteModal}
            >
              <Trash2 className="mr-2" size={16} />
              Deletar Conta
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal de confirmação para deletar conta */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <AlertTriangle className="text-red-500 mr-2" size={24} />
                Deletar Conta
              </h3>
              <button 
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Esta ação <span className="font-bold">não pode ser desfeita</span>. Isso irá deletar permanentemente sua conta e remover todos os seus dados dos nossos servidores.
              </p>
              
              <div className="bg-red-50 p-3 rounded-md border border-red-200">
                <p className="text-sm text-red-700">
                  Por favor, digite <strong>DELETAR</strong> para confirmar que você quer deletar permanentemente sua conta.
                </p>
              </div>
              
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Digite DELETAR para confirmar"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETAR' || isDeleting}
                  className={`px-4 py-2 rounded-md text-white flex items-center ${
                    deleteConfirmText === 'DELETAR' && !isDeleting
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-red-300 cursor-not-allowed'
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Deletando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar Conta
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProfilePage;
