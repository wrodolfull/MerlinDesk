import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { t } = useTranslation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);

      // Check if user exists
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();

      if (!existingClient) {
        toast.error(t('auth.emailNotFound'));
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success(t('auth.resetEmailSent'));
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(t('auth.resetPasswordError'));
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
            {t('auth.forgotPasswordTitle')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('auth.forgotPasswordDescription')}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {emailSent ? (
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  {t('auth.checkYourEmail')}
                </h2>
                <p className="text-gray-600 mb-4">
                  {t('auth.resetEmailInstructions')}
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    {t('auth.backToLogin')}
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label={t('auth.email')}
                  type="email"
                  error={errors.email?.message}
                  {...register('email', {
                    required: t('auth.emailRequired'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('auth.invalidEmail'),
                    },
                  })}
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  {t('auth.sendResetLink')}
                </Button>

                <div className="text-center mt-4">
                  <Link
                    to="/login"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    {t('auth.backToLogin')}
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;