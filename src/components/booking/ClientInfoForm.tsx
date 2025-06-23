import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Client } from '../../types';
import { Card, CardContent } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { ChevronLeft } from 'lucide-react';
import TagInput from '../ui/TagInput';

interface ClientInfoData extends Client {
  guests: string[];
}

interface ClientInfoFormProps {
  onSubmit: (data: ClientInfoData) => void;
  onBack: () => void;
}

export const ClientInfoForm = ({ onSubmit, onBack }: ClientInfoFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ClientInfoData>({
    defaultValues: {
      guests: [],
    },
  });
  
  const processSubmit = (data: ClientInfoData) => {
    const enrichedData = {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    onSubmit(enrichedData);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ChevronLeft size={16} />}
          onClick={onBack}
          className="mr-2"
        >
          Voltar
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Suas informações</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
            <Input
              label="Nome completo"
              error={errors.name?.message}
              required
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
            />
            
            <Input
              label="E-mail"
              type="email"
              error={errors.email?.message}
              required
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            
            <Input
              label="Telefone"
              error={errors.phone?.message}
              required
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9\-\+\(\)\s]+$/,
                  message: 'Invalid phone number',
                },
              })}
              helperText="Usaremos estas informações para envio de lembretes"
            />

            <Controller
              name="guests"
              control={control}
              render={({ field }) => (
                <TagInput
                  label="Convidados (opcional)"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Pressione Enter para adicionar um e-mail"
                />
              )}
            />
            
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                isLoading={isSubmitting}
              >
                Continuar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};