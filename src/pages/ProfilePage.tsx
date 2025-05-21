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

        const { data, error } = await supabase
          .from('clients')
          .select('name, email, phone')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        reset(data);
      } catch (err) {
        console.error('Error loading profile:', err);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setUpdating(true);

      // Update profile information
      const { error: profileError } = await supabase
        .from('clients')
        .update({
          name: data.name,
          phone: data.phone,
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Update password if provided
      if (data.currentPassword && data.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: data.newPassword,
        });

        if (passwordError) throw passwordError;
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
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
      
      // 1. Primeiro excluímos os dados do cliente da tabela 'clients'
      const { error: clientDeleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', user?.id);

      if (clientDeleteError) throw clientDeleteError;
      
      // 2. Depois excluímos a conta de autenticação
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
        user?.id as string
      );

      if (authDeleteError) {
        // Se falhar a exclusão da conta de autenticação, tente o método alternativo
        const { error: userDeleteError } = await supabase.rpc('delete_user');
        if (userDeleteError) throw userDeleteError;
      }
      
      // 3. Fazemos logout e redirecionamos para a página inicial
      await signOut();
      toast.success('Your account has been deleted');
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please contact support.');
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
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                {...register('name', { required: 'Name is required' })}
                error={errors.name?.message}
              />

              <Input
                label="Email"
                type="email"
                {...register('email')}
                disabled
              />

              <Input
                label="Phone"
                {...register('phone')}
                error={errors.phone?.message}
              />

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                
                <Input
                  type="password"
                  label="Current Password"
                  {...register('currentPassword')}
                  error={errors.currentPassword?.message}
                />

                <Input
                  type="password"
                  label="New Password"
                  {...register('newPassword', {
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  error={errors.newPassword?.message}
                />

                <Input
                  type="password"
                  label="Confirm New Password"
                  {...register('confirmPassword', {
                    validate: value =>
                      !newPassword || value === newPassword || 'Passwords do not match',
                  })}
                  error={errors.confirmPassword?.message}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={updating}>
                  Save Changes
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
              Deletar conta
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button 
              variant="primary" 
              className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
              onClick={openDeleteModal}
            >
              Deletar conta
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
                Deletar conta
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
                This action <span className="font-bold">cannot be undone</span>. This will permanently delete your account and remove all your data from our servers.
              </p>
              
              <div className="bg-red-50 p-3 rounded-md border border-red-200">
                <p className="text-sm text-red-700">
                  Please type <strong>DELETAR</strong> to confirm that you want to permanently delete your account.
                </p>
              </div>
              
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETAR to confirm"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETAR' || isDeleting}
                  className={`px-4 py-2 rounded-md text-white ${
                    deleteConfirmText === 'DELETAR' && !isDeleting
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-red-300 cursor-not-allowed'
                  }`}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
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