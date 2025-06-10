import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader, AlertTriangle, Trash2, Copy, RefreshCw, Plus, CheckCircle } from 'lucide-react';
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
  const [userToken, setUserToken] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [creatingApiKey, setCreatingApiKey] = useState(false);
  const [apiKeyData, setApiKeyData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>();

  const newPassword = watch('newPassword');

  // Função para gerar UUID com fallback
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Função para verificar se o usuário tem API Key
  const checkApiKey = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('user_id, client_secret, created_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar API Key:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao verificar API Key:', error);
      return null;
    }
  };

  // Função para criar API Key para o usuário
  const createApiKey = async (userId: string) => {
    try {
      setCreatingApiKey(true);
      const clientSecret = generateUUID();

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: userId,
          client_secret: clientSecret,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao criar API Key:', error);
        
        if (error.code === '23503') {
          toast.error('Erro: Verifique se a foreign key está correta (deve referenciar auth.users)');
          throw new Error('Foreign key constraint incorreta. Execute o SQL de correção primeiro.');
        }
        
        throw error;
      }

      toast.success('API Key criada com sucesso!');
      setHasApiKey(true);
      setApiKeyData(data);
      
      // Gerar token Base64
      const fullToken = btoa(`${data.user_id}:${data.client_secret}`);
      setUserToken(fullToken);
      
      return data;
    } catch (error) {
      console.error('Erro ao criar API Key:', error);
      toast.error('Erro ao criar API Key');
      throw error;
    } finally {
      setCreatingApiKey(false);
    }
  };

  // CORREÇÃO: useEffect simplificado - só usa Base64
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user) return;

        reset({
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
        });

        const apiKey = await checkApiKey(user.id);

        if (!apiKey) {
          setHasApiKey(false);
          setApiKeyData(null);
          setUserToken('');
          console.warn('API Key não encontrada para o usuário');
          return;
        }

        // Se tem API Key, gera o token Base64
        setHasApiKey(true);
        setApiKeyData(apiKey);
        const fullToken = btoa(`${apiKey.user_id}:${apiKey.client_secret}`);
        setUserToken(fullToken);
        
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

      const updateData: any = {
        data: {
          full_name: data.name,
          name: data.name,
          phone: data.phone,
        }
      };

      if (data.email !== user?.email) {
        updateData.email = data.email;
        toast.success('Um email de confirmação foi enviado para o novo endereço');
      }

      if (data.currentPassword && data.newPassword) {
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

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(userToken);
      toast.success('Token copiado para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar token');
    }
  };

  // CORREÇÃO: Regeneração simplificada - só atualiza client_secret e reconstrói Base64
  const handleRegenerateToken = async () => {
    if (!user?.id) return;

    if (!hasApiKey) {
      toast.error('Crie uma API Key primeiro');
      return;
    }

    try {
      setTokenLoading(true);
      const newSecret = generateUUID();

      const { error } = await supabase
        .from('api_keys')
        .update({ client_secret: newSecret })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      // Atualizar o estado local
      const updatedApiKeyData = { ...apiKeyData, client_secret: newSecret };
      setApiKeyData(updatedApiKeyData);

      // Gerar novo token Base64
      const fullToken = btoa(`${user.id}:${newSecret}`);
      setUserToken(fullToken);

      toast.success('Token regenerado com sucesso!');
    } catch (error) {
      console.error('Erro ao regenerar token:', error);
      toast.error('Erro ao regenerar token');
    } finally {
      setTokenLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!user?.id) return;
    
    try {
      await createApiKey(user.id);
    } catch (error) {
      console.error('Erro ao criar API Key:', error);
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
      
      await signOut();
      
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

        <Card>
          <CardHeader>
            <CardTitle>Configuração de API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasApiKey ? (
              <div className="text-center p-6 bg-yellow-50 rounded-md border border-yellow-200">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-yellow-800 mb-2">API Key não configurada</h3>
                <p className="text-sm text-yellow-700 mb-4">
                  Você precisa criar uma API Key para usar os recursos de integração com a API.
                </p>
                <Button
                  onClick={handleCreateApiKey}
                  isLoading={creatingApiKey}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {creatingApiKey ? 'Criando...' : 'Criar API Key'}
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                  <p className="text-sm text-green-700 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <strong>API Key configurada:</strong> Você pode usar os recursos da API.
                  </p>
                  {apiKeyData && (
                    <p className="text-xs text-green-600 mt-1">
                      Criada em: {new Date(apiKeyData.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Token de Autenticação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tokenLoading ? (
                      <div className="flex items-center justify-center p-8">
                      </div>
                    ) : userToken ? (
                      <div className="space-y-2">
                        <textarea
                          readOnly
                          value={userToken}
                          className="w-full text-xs p-3 bg-gray-100 border border-gray-300 rounded-md resize-none font-mono"
                          rows={3}
                        />
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-gray-50 rounded-md">
                        <p className="text-gray-600">Token não disponível</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyToken}
                        disabled={!userToken || tokenLoading}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Token
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerateToken}
                        disabled={tokenLoading}
                        isLoading={tokenLoading}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {tokenLoading ? 'Regenerando...' : 'Regenerar Token'}
                      </Button>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                      <p className="text-xs text-blue-600">
                        <strong>Como usar:</strong> Adicione o header <code>Authorization: Basic {userToken}</code> nas suas requisições para a API.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
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
