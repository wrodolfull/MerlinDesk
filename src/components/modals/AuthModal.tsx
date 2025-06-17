import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Card, CardContent } from '/root/MerlinDesk/src/components/ui/Card.tsx';
import Input from '/root/MerlinDesk/src/components/ui/Input.tsx';
import Button from '/root/MerlinDesk/src/components/ui/Button.tsx';
import { supabase } from '/root/MerlinDesk/src/lib/supabase.ts';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface LoginFormValues {
  email: string;
  password: string;
}

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SelectedPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceText: string;
  period: string;
  features: string[];
  buttonText: string;
  popular: boolean;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  selectedPlan: SelectedPlan | null;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  selectedPlan 
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  // Form para Login
  const loginForm = useForm<LoginFormValues>();
  
  // Form para Registro
  const registerForm = useForm<RegisterFormValues>();

  if (!isOpen) return null;

  const handleLogin = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      loginForm.clearErrors();
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          loginForm.setError('email', {
            type: 'manual',
            message: t('auth.invalidCredentials')
          });
          loginForm.setError('password', {
            type: 'manual',
            message: t('auth.invalidCredentials')
          });
          toast.error(t('auth.invalidCredentials'));
          return;
        }
        toast.error(t('auth.loginError'));
        return;
      }

      if (!authData?.user) {
        toast.error(t('auth.userNotFound'));
        return;
      }

      toast.success(t('auth.loginSuccess'));
      onSuccess(authData.user);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      registerForm.clearErrors();

      if (data.password !== data.confirmPassword) {
        registerForm.setError('confirmPassword', {
          type: 'manual',
          message: t('auth.passwordsDoNotMatch')
        });
        return;
      }
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          registerForm.setError('email', {
            type: 'manual',
            message: t('auth.emailAlreadyExists')
          });
          toast.error(t('auth.emailAlreadyExists'));
          return;
        }
        toast.error(t('auth.registerError'));
        return;
      }
      
      if (authData.user) {
        toast.success(t('auth.registerSuccess'));
        onSuccess(authData.user);
      } else {
        toast(t('auth.checkEmailConfirmation'));
        onClose();
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error(t('auth.registerError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
            </h2>
            {selectedPlan && (
              <p className="text-gray-600">
                {t('Acesse sua conta ou crie uma nova para contratar o plano')} <strong>{selectedPlan.name}</strong>
              </p>
            )}
          </div>

          <Card>
            <CardContent className="pt-6">
              {isLogin ? (
                // Formulário de Login
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <Input
                    label={t('auth.email')}
                    type="email"
                    autoComplete="email"
                    error={loginForm.formState.errors.email?.message}
                    {...loginForm.register('email', {
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
                    error={loginForm.formState.errors.password?.message}
                    {...loginForm.register('password', {
                      required: t('auth.passwordRequired'),
                      minLength: {
                        value: 6,
                        message: t('auth.passwordMinLength'),
                      },
                    })}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-[#7C45D0] text-white hover:bg-[#6B3BB8]"
                    isLoading={isLoading}
                  >
                    {t('auth.signIn')}
                  </Button>
                </form>
              ) : (
                // Formulário de Registro
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <Input
                    label={t('auth.fullName')}
                    type="text"
                    autoComplete="name"
                    error={registerForm.formState.errors.name?.message}
                    {...registerForm.register('name', {
                      required: t('auth.nameRequired'),
                      minLength: {
                        value: 2,
                        message: t('auth.nameMinLength'),
                      },
                    })}
                  />

                  <Input
                    label={t('auth.email')}
                    type="email"
                    autoComplete="email"
                    error={registerForm.formState.errors.email?.message}
                    {...registerForm.register('email', {
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
                    autoComplete="new-password"
                    error={registerForm.formState.errors.password?.message}
                    {...registerForm.register('password', {
                      required: t('auth.passwordRequired'),
                      minLength: {
                        value: 6,
                        message: t('auth.passwordMinLength'),
                      },
                    })}
                  />

                  <Input
                    label={t('auth.confirmPassword')}
                    type="password"
                    autoComplete="new-password"
                    error={registerForm.formState.errors.confirmPassword?.message}
                    {...registerForm.register('confirmPassword', {
                      required: t('auth.confirmPasswordRequired'),
                    })}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-[#7C45D0] text-white hover:bg-[#6B3BB8]"
                    isLoading={isLoading}
                  >
                    {t('auth.createAccount')}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center text-sm text-gray-600">
                {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}{' '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    loginForm.reset();
                    registerForm.reset();
                  }}
                  className="font-medium text-[#7C45D0] hover:text-[#6B3BB8]"
                >
                  {isLogin ? t('auth.signUp') : t('auth.signIn')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;