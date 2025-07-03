import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { VideoCallSettings, CreateVideoCallSettings, UpdateVideoCallSettings } from '../types';

export const useVideoCallSettings = (professionalId?: string) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<VideoCallSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!professionalId || !user?.id) {
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('video_call_settings')
        .select('*')
        .eq('professional_id', professionalId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          id: data.id,
          professionalId: data.professional_id,
          videoCallEnabled: data.video_call_enabled,
          meetingNotesEnabled: data.meeting_notes_enabled,
          sendSummaryByEmail: data.send_summary_by_email,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        });
      } else {
        setSettings(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch video call settings');
      console.error('Video call settings fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [professionalId, user?.id]);

  const saveSettings = useCallback(async (newSettings: UpdateVideoCallSettings) => {
    if (!professionalId || !user?.id) {
      throw new Error('Professional ID and user required');
    }

    setSaving(true);
    setError(null);

    try {
      let result;

      if (settings) {
        // Update existing settings
        const { data, error } = await supabase
          .from('video_call_settings')
          .update({
            video_call_enabled: newSettings.videoCallEnabled,
            meeting_notes_enabled: newSettings.meetingNotesEnabled,
            send_summary_by_email: newSettings.sendSummaryByEmail,
          })
          .eq('id', settings.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new settings
        const createData: CreateVideoCallSettings = {
          professionalId,
          videoCallEnabled: newSettings.videoCallEnabled || false,
          meetingNotesEnabled: newSettings.meetingNotesEnabled || false,
          sendSummaryByEmail: newSettings.sendSummaryByEmail || false,
        };

        const { data, error } = await supabase
          .from('video_call_settings')
          .insert({
            professional_id: createData.professionalId,
            video_call_enabled: createData.videoCallEnabled,
            meeting_notes_enabled: createData.meetingNotesEnabled,
            send_summary_by_email: createData.sendSummaryByEmail,
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Update local state
      setSettings({
        id: result.id,
        professionalId: result.professional_id,
        videoCallEnabled: result.video_call_enabled,
        meetingNotesEnabled: result.meeting_notes_enabled,
        sendSummaryByEmail: result.send_summary_by_email,
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at),
      });

      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save video call settings';
      setError(message);
      console.error('Video call settings save error:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [professionalId, user?.id, settings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    saving,
    refetch: fetchSettings,
    saveSettings,
  };
}; 