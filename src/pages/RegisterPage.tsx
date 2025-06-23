import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  agreeTerms: boolean;
}

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);

      // ✅ Cria apenas o usuário dono no Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            business_name: data.businessName,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('User creation failed');

      // ✅ A assinatura grátis é criada automaticamente pelo trigger do banco
      // Não precisamos criar manualmente aqui

      toast.success(t('auth.registrationSuccess'));
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Registration error:', error);

      if (error.code === '23505' || (error.message && error.message.includes('duplicate'))) {
        toast.error('This email is already in use. Please sign in.');
        navigate('/login');
        return;
      }

      toast.error(error.message || t('auth.registrationError'));
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
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{t('auth.createAccount')}</h1>
          <p className="mt-2 text-gray-600">{t('auth.startManaging')}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label={t('auth.fullName')}
                autoComplete="name"
                error={errors.name?.message}
                {...register('name', { required: t('auth.nameRequired') })}
              />

              <Input
                label={t('auth.email')}
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email', {
                  required: t('auth.emailRequired'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('auth.invalidEmail'),
                  },
                })}
              />

              <Input
                label={t('auth.businessName')}
                error={errors.businessName?.message}
                {...register('businessName', { required: t('auth.businessNameRequired') })}
              />

              <Input
                label={t('auth.password')}
                type="password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password', {
                  required: t('auth.passwordRequired'),
                  minLength: { value: 8, message: t('auth.passwordMinLength') },
                })}
              />

              <Input
                label={t('auth.confirmPassword')}
                type="password"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: t('auth.confirmPasswordRequired'),
                  validate: (value) => value === password || t('auth.passwordsDoNotMatch'),
                })}
              />

              <div className="flex items-center">
                <input
                  id="agree-terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  {...register('agreeTerms', { required: t('auth.agreeToTerms') })}
                />
                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
                  {t('auth.iAgree')}{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                    {t('auth.termsOfService')}
                  </Link>{' '}
                  {t('auth.and')}{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                    {t('auth.privacyPolicy')}
                  </Link>
                </label>
              </div>
              {errors.agreeTerms && (
                <p className="text-sm text-error-500">{errors.agreeTerms.message}</p>
              )}

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {t('auth.signUp')}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                {t('auth.signIn')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
