import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) throw error;

      toast.success(t('auth.passwordResetSuccess'));
      navigate('/login');
    } catch (error) {
      console.error('Password update error:', error);
      toast.error(t('auth.passwordResetError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Toaster />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Calendar className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {t('auth.resetPasswordTitle')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('auth.resetPasswordDescription')}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label={t('auth.newPassword')}
                type="password"
                error={errors.password?.message}
                {...register('password', {
                  required: t('auth.passwordRequired'),
                  minLength: {
                    value: 8,
                    message: t('auth.passwordMinLength'),
                  },
                })}
              />

              <Input
                label={t('auth.confirmNewPassword')}
                type="password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: t('auth.confirmPasswordRequired'),
                  validate: (value) =>
                    value === password || t('auth.passwordsDoNotMatch'),
                })}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                {t('auth.resetPassword')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;