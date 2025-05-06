import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useForm, Controller } from 'react-hook-form';
import { Brain, Loader, Upload, Save, Clock, Mic, FileUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import WorkingHoursConfig from '../components/ai/WorkingHoursConfig';
import AudioTranscriptionSection from '../components/ai/AudioTranscriptionSection';
import FileUploadSection from '../components/ai/FileUploadSection';

interface TrainingConfig {
  model: string;
  provider: string;
  temperature: number;
  maxTokens: number;
  trainingData: string;
  prompt: string;
  workingHours: {
    is24h: boolean;
    schedule: {
      [key: string]: {
        isEnabled: boolean;
        startTime?: string;
        endTime?: string;
      };
    };
  };
}

const AITrainingPage = () => {
  const { user } = useAuth();
  const [isTraining, setIsTraining] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<TrainingConfig[]>([]);
  const [userSettings, setUserSettings] = useState<{
    deepseek_key?: string;
    openai_key?: string;
    elevenlabs_key?: string;
  }>();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TrainingConfig>({
    defaultValues: {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      trainingData: '',
      prompt: '',
      workingHours: {
        is24h: false,
        schedule: {
          monday: { isEnabled: true, startTime: '09:00', endTime: '17:00' },
          tuesday: { isEnabled: true, startTime: '09:00', endTime: '17:00' },
          wednesday: { isEnabled: true, startTime: '09:00', endTime: '17:00' },
          thursday: { isEnabled: true, startTime: '09:00', endTime: '17:00' },
          friday: { isEnabled: true, startTime: '09:00', endTime: '17:00' },
          saturday: { isEnabled: false },
          sunday: { isEnabled: false },
        },
      },
    },
  });

  const provider = watch('provider');
  const workingHours = watch('workingHours');

  const providerOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'deepseek', label: 'DeepSeek' },
  ];

  const modelOptions = {
    openai: [
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    ],
    deepseek: [
      { value: 'deepseek-chat', label: 'DeepSeek Chat' },
      { value: 'deepseek-coder', label: 'DeepSeek Coder' },
    ],
  };

  useEffect(() => {
    setValue('model', modelOptions[provider as keyof typeof modelOptions][0].value);
  }, [provider, setValue]);

  useEffect(() => {
    fetchSavedConfigs();
    fetchUserSettings();
  }, [user]);

  const fetchUserSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('deepseek_key, openai_key, elevenlabs_key')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setUserSettings(data);
    } catch (error) {
      console.error('Error fetching user settings:', error);
    }
  };

  const fetchSavedConfigs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_configurations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedConfigs(data || []);
    } catch (error) {
      console.error('Error fetching configurations:', error);
      toast.error('Failed to load saved configurations');
    }
  };

  const validateProviderKey = () => {
    if (provider === 'deepseek' && !userSettings?.deepseek_key) {
      toast.error('Please configure your DeepSeek API key in Settings first');
      return false;
    }
    if (provider === 'openai' && !userSettings?.openai_key) {
      toast.error('Please configure your OpenAI API key in Settings first');
      return false;
    }
    return true;
  };

  const onSubmit = async (data: TrainingConfig) => {
    if (!validateProviderKey()) return;

    try {
      setIsTraining(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('Authentication required');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || 'Training failed');

      toast.success('Training completed successfully!');
      
      const { error } = await supabase
        .from('ai_configurations')
        .insert({
          model: data.model,
          provider: data.provider,
          temperature: data.temperature,
          max_tokens: data.maxTokens,
          training_data: data.trainingData,
          prompt: data.prompt,
          working_hours: data.workingHours,
          user_id: user?.id,
        });

      if (error) throw error;
      
      fetchSavedConfigs();
    } catch (error) {
      console.error('Training error:', error);
      toast.error(error.message || 'Failed to complete training');
    } finally {
      setIsTraining(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setValue('trainingData', text);
    };
    reader.readAsText(file);
  };

  const loadConfig = (config: TrainingConfig) => {
    Object.entries(config).forEach(([key, value]) => {
      setValue(key as keyof TrainingConfig, value);
    });
    toast.success('Configuration loaded');
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Training Configuration</h1>
        <p className="text-gray-600">Configure and train your AI model with custom data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Controller
                  name="provider"
                  control={control}
                  rules={{ required: 'Provider is required' }}
                  render={({ field }) => (
                    <Select
                      label="AI Provider"
                      options={providerOptions}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.provider?.message}
                    />
                  )}
                />

                <Controller
                  name="model"
                  control={control}
                  rules={{ required: 'Model is required' }}
                  render={({ field }) => (
                    <Select
                      label="Model"
                      options={modelOptions[provider as keyof typeof modelOptions]}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.model?.message}
                    />
                  )}
                />

                <Input
                  type="number"
                  label="Temperature"
                  step="0.1"
                  min="0"
                  max="2"
                  {...register('temperature', {
                    required: 'Temperature is required',
                    min: { value: 0, message: 'Minimum temperature is 0' },
                    max: { value: 2, message: 'Maximum temperature is 2' },
                  })}
                  error={errors.temperature?.message}
                />

                <Input
                  type="number"
                  label="Max Tokens"
                  {...register('maxTokens', {
                    required: 'Max tokens is required',
                    min: { value: 1, message: 'Minimum tokens is 1' },
                  })}
                  error={errors.maxTokens?.message}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Training Data
                  </label>
                  <div className="mb-2">
                    <input
                      type="file"
                      accept=".txt,.json,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload File
                    </label>
                  </div>
                  <textarea
                    {...register('trainingData', {
                      required: 'Training data is required',
                    })}
                    className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter or upload your training data here..."
                  />
                  {errors.trainingData && (
                    <p className="mt-1 text-sm text-error-500">{errors.trainingData.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Prompt
                  </label>
                  <textarea
                    {...register('prompt', {
                      required: 'System prompt is required',
                    })}
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter the system prompt for your AI model..."
                  />
                  {errors.prompt && (
                    <p className="mt-1 text-sm text-error-500">{errors.prompt.message}</p>
                  )}
                </div>

                <WorkingHoursConfig
                  value={workingHours}
                  onChange={(value) => setValue('workingHours', value)}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="submit"
                    isLoading={isTraining}
                    leftIcon={<Brain size={16} />}
                  >
                    {isTraining ? 'Training...' : 'Start Training'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <AudioTranscriptionSection
            userSettings={userSettings}
            onTranscriptionComplete={(text) => setValue('trainingData', text)}
          />

          <FileUploadSection />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Saved Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            {savedConfigs.length > 0 ? (
              <div className="space-y-4">
                {savedConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{config.provider} - {config.model}</h3>
                        <p className="text-sm text-gray-500">
                          Temperature: {config.temperature} | Max Tokens: {config.maxTokens}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(config.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Save size={14} />}
                        onClick={() => loadConfig(config)}
                      >
                        Load
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No saved configurations yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AITrainingPage;