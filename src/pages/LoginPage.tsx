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

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      clearErrors();
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('email', {
            type: 'manual',
            message: t('auth.invalidCredentials')
          });
          setError('password', {
            type: 'manual',
            message: t('auth.invalidCredentials')
          });
          toast.error(t('auth.invalidCredentials'));
          return;
        }

        // Handle other potential errors
        toast.error(t('auth.loginError'));
        return;
      }

      if (!authData?.user) {
        toast.error(t('auth.userNotFound'));
        return;
      }

      toast.success(t('auth.loginSuccess'));
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('auth.loginError'));
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
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{t('auth.welcomeBack')}</h1>
          <p className="mt-2 text-gray-600">{t('auth.signInToContinue')}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                label={t('auth.password')}
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password', {
                  required: t('auth.passwordRequired'),
                  minLength: {
                    value: 6,
                    message: t('auth.passwordMinLength'),
                  },
                })}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...register('rememberMe')}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    {t('auth.rememberMe')}
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="text-primary-600 hover:text-primary-500">
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                {t('auth.signIn')}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              {t('auth.dontHaveAccount')}{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                {t('auth.signUp')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;