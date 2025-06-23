import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader, AlertTriangle, Trash2, Copy, RefreshCw, Plus, CheckCircle, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/Dialog';

interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
}

interface PasswordFormData {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const ProfilePage = () => {
  const { user, signOut, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToken, setUserToken] = useState('');
  const [tokenVisible, setTokenVisible] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [apiKeyData, setApiKeyData] = useState<any>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>();

  const newPassword = watchPassword('newPassword');

  const generateUUID = () => crypto.randomUUID();

  const checkApiKey = async (userId: string) => {
    const { data, error } = await supabase.from('api_keys').select('*').eq('user_id', userId).single();
    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar API Key:', error);
      toast.error('Erro ao buscar API Key');
    }
    return data;
  };

  const createApiKey = async (userId: string) => {
    try {
      setTokenLoading(true);
      const { data, error } = await supabase.from('api_keys').insert({ user_id: userId, client_secret: generateUUID() }).select().single();
      if (error) throw error;
      toast.success('API Key criada com sucesso!');
      setApiKeyData(data);
      return data;
    } catch (error) {
      console.error('Erro ao criar API Key:', error);
      toast.error('Falha ao criar API Key');
    } finally {
      setTokenLoading(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        resetProfile({
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
        });
        const keyData = await checkApiKey(user.id);
        if (keyData) setApiKeyData(keyData);
      } catch (err) {
        toast.error('Falha ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user, resetProfile]);

  useEffect(() => {
    if (apiKeyData) {
      setUserToken(btoa(`${apiKeyData.user_id}:${apiKeyData.client_secret}`));
    } else {
      setUserToken('');
    }
  }, [apiKeyData]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setUpdatingProfile(true);
    try {
      const updateData: any = { data: { full_name: data.name, phone: data.phone } };
      if (data.email !== user?.email) {
        updateData.email = data.email;
      }
      const { data: updatedUser, error } = await supabase.auth.updateUser(updateData);
      if (error) throw error;
      
      // Atualizar o contexto de autenticação com o usuário atualizado
      if (updatedUser.user) {
        updateUser(updatedUser.user);
      }
      
      toast.success('Perfil atualizado com sucesso!');
      if (data.email !== user?.email) {
        toast('E-mail de verificação enviado para o novo endereço.', { icon: '📧' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Falha ao atualizar perfil');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!data.newPassword) return;
    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.newPassword });
      if (error) throw error;
      toast.success('Senha atualizada com sucesso!');
      resetPassword();
    } catch (error: any) {
      toast.error(error.message || 'Falha ao alterar senha');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (!user?.id || !apiKeyData) return;
    setTokenLoading(true);
    try {
      const { data, error } = await supabase.from('api_keys').update({ client_secret: generateUUID() }).eq('user_id', user.id).select().single();
      if (error) throw error;
      setApiKeyData(data);
      toast.success('Token regenerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao regenerar token');
    } finally {
      setTokenLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETAR' || !user) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: user.id },
      });
      if (error) throw error;
      
      toast.success('Sua conta foi deletada com sucesso.');
      await signOut();
      navigate('/login', { replace: true });

    } catch (error: any) {
      toast.error(error.data?.error || 'Falha ao deletar conta. Contate o suporte.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader className="w-8 h-8 animate-spin" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <Toaster position="top-center" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações do Perfil</h1>
        <p className="text-gray-600 mt-1">Gerencie as informações da sua conta e segurança.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Coluna de Ações */}
        <div className="lg:col-span-2 space-y-8">
          {/* Informações Pessoais */}
          <Card>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize seu nome, e-mail e telefone.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Nome Completo" {...registerProfile('name', { required: 'Nome é obrigatório' })} error={profileErrors.name?.message} />
                <Input label="Email" type="email" {...registerProfile('email', { required: 'Email é obrigatório' })} error={profileErrors.email?.message} />
                <Input label="Telefone" {...registerProfile('phone')} error={profileErrors.phone?.message} />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" isLoading={updatingProfile}>Salvar Alterações</Button>
              </CardFooter>
            </form>
          </Card>

          {/* Alterar Senha */}
          <Card>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>Para sua segurança, escolha uma senha forte.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input type="password" label="Nova Senha" {...registerPassword('newPassword', { minLength: { value: 8, message: 'A senha deve ter pelo menos 8 caracteres' }})} error={passwordErrors.newPassword?.message} />
                <Input type="password" label="Confirmar Nova Senha" {...registerPassword('confirmPassword', { validate: value => !newPassword || value === newPassword || 'As senhas não coincidem' })} error={passwordErrors.confirmPassword?.message} />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" isLoading={updatingPassword}>Alterar Senha</Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Coluna de Segurança */}
        <div className="lg:col-span-1 space-y-8">
          {/* API Key */}
          <Card>
            <CardHeader>
              <CardTitle>API Key</CardTitle>
              <CardDescription>Use esta chave para integrar com outros serviços.</CardDescription>
            </CardHeader>
            <CardContent>
              {apiKeyData ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      label="Seu Token"
                      readOnly
                      value={tokenVisible ? userToken : '••••••••••••••••••••••••••••'}
                      className="pr-10"
                    />
                    <button type="button" onClick={() => setTokenVisible(!tokenVisible)} className="absolute right-2 top-8 text-gray-500 hover:text-gray-700">
                      {tokenVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(userToken); toast.success('Copiado!'); }} leftIcon={<Copy size={14} />}>Copiar</Button>
                    <Button variant="outline" size="sm" onClick={handleRegenerateToken} isLoading={tokenLoading} leftIcon={<RefreshCw size={14} />}>Regenerar</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-4">Você ainda não possui uma API key.</p>
                  <Button onClick={() => createApiKey(user!.id)} isLoading={tokenLoading}>Gerar API Key</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zona de Perigo */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                A exclusão da sua conta é uma ação irreversível. Todos os seus dados, calendários, e agendamentos serão permanentemente removidos.
              </p>
              <Button variant="destructive" onClick={() => setShowDeleteModal(true)} leftIcon={<Trash2 size={16} />}>
                Deletar Minha Conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Confirmação para Deletar */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Você tem certeza absoluta?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente sua conta e remover seus dados de nossos servidores.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-2">
              Por favor, digite <strong className="text-gray-800">DELETAR</strong> para confirmar.
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETAR"
              className="border-gray-400"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              isLoading={isDeleting}
              disabled={deleteConfirmText !== 'DELETAR' || isDeleting}
            >
              {isDeleting ? 'Deletando...' : 'Eu entendo, delete minha conta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ProfilePage;
