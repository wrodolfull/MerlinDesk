import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { Professional, Specialty } from '../../types';
import toast, { Toaster } from 'react-hot-toast';
import ReactSelect from 'react-select';
import { Camera, X, User } from 'lucide-react';

interface EditProfessionalFormData {
  name: string;
  email: string;
  phone?: string;
  specialtyIds: string[];
  bio?: string;
  avatar?: string;
}

interface EditProfessionalModalProps {
  professional: Professional;
  specialties: Specialty[];
  onClose: () => void;
  onSuccess: () => void;
  refetch?: () => Promise<void>;
}

const EditProfessionalModal: React.FC<EditProfessionalModalProps> = ({
  professional,
  specialties = [],
  onClose,
  onSuccess,
  refetch,
}) => {
  // Estados para o avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(professional.avatar || null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditProfessionalFormData>({
    defaultValues: {
      name: professional.name,
      email: professional.email,
      phone: professional.phone || '',
      specialtyIds: (professional.specialties ?? []).map((s) => s.id),
      bio: professional.bio || '',
      avatar: professional.avatar || '',
    }
  });

  useEffect(() => {
    reset({
      name: professional.name,
      email: professional.email,
      phone: professional.phone || '',
      specialtyIds: (professional.specialties ?? []).map((s) => s.id),
      bio: professional.bio || '',
      avatar: professional.avatar || '',
    });
    setAvatarUrl(professional.avatar || null);
    setAvatarPreview(null);
  }, [professional, reset]);

  // Validação de arquivo de imagem
  const validateImageFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('Formato de arquivo não suportado. Use JPG, PNG ou WebP.');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Tamanho máximo: 5MB.');
      return false;
    }

    return true;
  };

  // Manipular mudança de arquivo
  const handleAvatarChange = (file: File | null) => {
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }

    if (!validateImageFile(file)) {
      return;
    }

    setAvatarFile(file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload do avatar para o Supabase Storage
  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      setUploadingAvatar(true);
      
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substr(2, 8)}.${fileExt}`;
      const filePath = `professionals/${fileName}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Erro ao fazer upload da imagem');
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        throw new Error('Erro ao obter URL da imagem');
      }

      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Remover avatar
  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarUrl(null);
    setValue('avatar', '');
  };

  // Eventos de drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAvatarChange(e.dataTransfer.files[0]);
    }
  };

  const onSubmit = async (data: EditProfessionalFormData) => {
    try {
      // Upload do avatar se houver um novo arquivo
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(avatarFile);
        if (!finalAvatarUrl) {
          // Se o upload falhou, continua com o avatar atual
          finalAvatarUrl = avatarUrl;
        }
      }

      // Atualizar profissional
      const { error: updateError } = await supabase
        .from('professionals')
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          bio: data.bio || null,
          avatar: finalAvatarUrl,
        })
        .eq('id', professional.id);

      if (updateError) throw updateError;

      // Atualizar especialidades na tabela de junção (modelo many-to-many)
      if (data.specialtyIds && data.specialtyIds.length > 0) {
        // Primeiro, remover todas as especialidades atuais
        const { error: deleteError } = await supabase
          .from('professional_specialties')
          .delete()
          .eq('professional_id', professional.id);

        if (deleteError) throw deleteError;

        // Depois, inserir as novas especialidades
        const professionalSpecialties = data.specialtyIds.map(specialtyId => ({
          professional_id: professional.id,
          specialty_id: specialtyId,
        }));

        const { error: insertError } = await supabase
          .from('professional_specialties')
          .insert(professionalSpecialties);

        if (insertError) throw insertError;
      } else {
        // Se não há especialidades selecionadas, remover todas
        const { error: deleteError } = await supabase
          .from('professional_specialties')
          .delete()
          .eq('professional_id', professional.id);

        if (deleteError) throw deleteError;
      }

      toast.success('Profissional atualizado com sucesso!');
      onSuccess();
      if (refetch) await refetch();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar profissional');
      console.error('Error updating professional:', error);
    }
  };

  const specialtyOptions = specialties.map((s) => ({
    value: s.id,
    label: s.name || 'Especialidade sem nome',
  }));

  // Determinar qual imagem mostrar (preview, atual ou placeholder)
  const currentImageToShow = avatarPreview || avatarUrl;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Toaster />
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Editar Profissional</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Upload de Avatar */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Foto de Perfil
              </label>
              
              {/* Preview do Avatar ou Área de Upload */}
              {currentImageToShow ? (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={currentImageToShow}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      disabled={isSubmitting || uploadingAvatar}
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">
                      {avatarFile && (
                        <>
                          <p className="font-medium">{avatarFile.name}</p>
                          <p>{(avatarFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </>
                      )}
                      {!avatarFile && avatarUrl && (
                        <p className="font-medium">Imagem atual</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('avatar-upload-edit')?.click()}
                      disabled={isSubmitting || uploadingAvatar}
                      className="mt-2"
                    >
                      Alterar foto
                    </Button>
                  </div>
                </div>
              ) : (
                /* Área de Upload */
                <div
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                    ${dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('avatar-upload-edit')?.click()}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-gray-100 rounded-full p-3">
                      <Camera className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Clique para selecionar ou arraste uma imagem
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG ou WebP até 5MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <input
                id="avatar-upload-edit"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
                className="hidden"
                disabled={isSubmitting || uploadingAvatar}
              />
            </div>

            {/* Campos do formulário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome Completo *"
                error={errors.name?.message}
                {...register('name', { required: 'Nome é obrigatório' })}
                disabled={isSubmitting || uploadingAvatar}
              />

              <Input
                type="email"
                label="E-mail *"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
                disabled={isSubmitting || uploadingAvatar}
              />
            </div>

            <Input
              label="Telefone"
              {...register('phone', {
                pattern: {
                  value: /^[0-9\-\+\(\)\s]+$/,
                  message: 'Número de telefone inválido',
                },
              })}
              error={errors.phone?.message}
              disabled={isSubmitting || uploadingAvatar}
            />

            <Controller
              name="specialtyIds"
              control={control}
              rules={{ required: 'Pelo menos uma especialidade é obrigatória' }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidades *
                  </label>
                  <ReactSelect
                    isMulti
                    options={specialtyOptions}
                    value={specialtyOptions.filter(option => field.value?.includes(option.value))}
                    onChange={(selected) =>
                      field.onChange(Array.isArray(selected) ? selected.map(opt => opt.value) : [])
                    }
                    isDisabled={isSubmitting || uploadingAvatar}
                    classNamePrefix="react-select"
                    placeholder="Selecione as especialidades..."
                    noOptionsMessage={() => "Nenhuma especialidade encontrada"}
                  />
                  {errors.specialtyIds && (
                    <p className="mt-1 text-sm text-red-600">{errors.specialtyIds.message}</p>
                  )}
                </div>
              )}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biografia
              </label>
              <textarea
                {...register('bio')}
                disabled={isSubmitting || uploadingAvatar}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Breve descrição sobre o profissional..."
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || uploadingAvatar}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting || uploadingAvatar}
                disabled={isSubmitting || uploadingAvatar}
              >
                {uploadingAvatar ? 'Fazendo upload...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfessionalModal;
