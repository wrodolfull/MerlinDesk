import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ProfessionalAccess, 
  ProfessionalPermissions, 
  ProfessionalUser 
} from '../types';

export const useProfessionalAccess = () => {
  const { user } = useAuth();
  const [professionalUser, setProfessionalUser] = useState<ProfessionalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar se o usuário atual é um profissional
  const checkIfProfessional = useCallback(async () => {
    if (!user?.id) {
      setProfessionalUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar profissional pelo auth_user_id
      const { data: professional, error: professionalError } = await supabase
        .from('professionals')
        .select(`
          id,
          name,
          email,
          avatar,
          auth_user_id
        `)
        .eq('auth_user_id', user.id)
        .single();

      if (professionalError && professionalError.code !== 'PGRST116') {
        throw professionalError;
      }

      if (!professional) {
        setProfessionalUser(null);
        setLoading(false);
        return;
      }

      // Buscar permissões do profissional
      const { data: access, error: accessError } = await supabase
        .from('professional_access')
        .select('*')
        .eq('professional_id', professional.id)
        .eq('auth_user_id', user.id)
        .single();

      if (accessError && accessError.code !== 'PGRST116') {
        throw accessError;
      }

      // Mapear permissões
      const permissions: ProfessionalPermissions = {
        canViewAppointments: access?.can_view_appointments ?? true,
        canEditAppointments: access?.can_edit_appointments ?? false,
        canViewCalendar: access?.can_view_calendar ?? true,
        canEditCalendar: access?.can_edit_calendar ?? false,
        canViewClients: access?.can_view_clients ?? true,
        canEditClients: access?.can_edit_clients ?? false,
        canViewSpecialties: access?.can_view_specialties ?? true,
        canEditSpecialties: access?.can_edit_specialties ?? false,
        canViewWorkingHours: access?.can_view_working_hours ?? true,
        canEditWorkingHours: access?.can_edit_working_hours ?? true,
        canViewVideoCalls: access?.can_view_video_calls ?? true,
        canEditVideoCalls: access?.can_edit_video_calls ?? false,
        canViewReports: access?.can_view_reports ?? false,
        canEditReports: access?.can_edit_reports ?? false,
      };

      const professionalUserData: ProfessionalUser = {
        id: user.id,
        professionalId: professional.id,
        name: professional.name,
        email: professional.email || user.email || '',
        avatar: professional.avatar || user.user_metadata?.avatar_url,
        permissions,
      };

      setProfessionalUser(professionalUserData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to check professional access');
      console.error('Professional access check error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email, user?.user_metadata?.avatar_url]);

  // Verificar permissão específica
  const hasPermission = useCallback((permission: keyof ProfessionalPermissions): boolean => {
    if (!professionalUser) return false;
    return professionalUser.permissions[permission];
  }, [professionalUser]);

  // Verificar se é um profissional
  const isProfessional = useCallback((): boolean => {
    return professionalUser !== null;
  }, [professionalUser]);

  // Atualizar permissões
  const updatePermissions = useCallback(async (permissions: Partial<ProfessionalPermissions>) => {
    if (!professionalUser) {
      throw new Error('User is not a professional');
    }

    try {
      const updateData: any = {};
      
      // Mapear permissões para o formato do banco
      Object.entries(permissions).forEach(([key, value]) => {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateData[dbKey] = value;
      });

      const { error } = await supabase
        .from('professional_access')
        .update(updateData)
        .eq('professional_id', professionalUser.professionalId)
        .eq('auth_user_id', user?.id);

      if (error) throw error;

      // Atualizar estado local
      setProfessionalUser(prev => prev ? {
        ...prev,
        permissions: { ...prev.permissions, ...permissions }
      } : null);

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update permissions';
      setError(message);
      throw err;
    }
  }, [professionalUser, user?.id]);

  useEffect(() => {
    checkIfProfessional();
  }, [checkIfProfessional]);

  return {
    professionalUser,
    loading,
    error,
    isProfessional,
    hasPermission,
    updatePermissions,
    refetch: checkIfProfessional,
  };
}; 