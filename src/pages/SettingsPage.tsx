import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import LanguageSelector from '../components/ui/LanguageSelector';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Check, Key } from 'lucide-react';
import toast from 'react-hot-toast';

interface BusinessSettingsForm {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
}

interface NotificationSettingsForm {
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderTime: number;
}

interface APIKeysForm {
  openaiKey: string;
  deepseekKey: string;
}

const SettingsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { timezone, setTimezone } = useSettings();
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<APIKeysForm>({
    openaiKey: '',
    deepseekKey: '',
  });

  // Get the active tab from URL params or default to 'general'
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'general';

  const setTab = (tab: string) => {
    navigate(`/settings?tab=${tab}`);
  };

  useEffect(() => {
    // If user is not authenticated, set loading to false and return early
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch subscription data
        const { data: subscription, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            plan:subscription_plans(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (subscriptionError) throw subscriptionError;
        setCurrentPlan(subscription?.plan || null);

        // Fetch API keys
        const { data: settings, error: settingsError } = await supabase
          .from('user_settings')
          .select('openai_key, deepseek_key')
          .eq('user_id', user.id)
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;

        if (settings) {
          setApiKeys({
            openaiKey: settings.openai_key || '',
            deepseekKey: settings.deepseek_key || '',
          });
        }

        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const businessForm = useForm<BusinessSettingsForm>({
    defaultValues: {
      businessName: 'My Business',
      email: 'contact@mybusiness.com',
      phone: '(555) 123-4567',
      address: '123 Business St, City, State 12345',
      timezone: timezone,
    },
  });

  const notificationForm = useForm<NotificationSettingsForm>({
    defaultValues: {
      emailNotifications: true,
      smsNotifications: true,
      reminderTime: 24,
    },
  });

  const apiKeysForm = useForm<APIKeysForm>({
    defaultValues: apiKeys,
  });

  const onBusinessSubmit = (data: BusinessSettingsForm) => {
    setTimezone(data.timezone);
    console.log('Business settings:', data);
  };

  const onNotificationSubmit = (data: NotificationSettingsForm) => {
    console.log('Notification settings:', data);
  };

  const onAPIKeysSubmit = async (data: APIKeysForm) => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user?.id,
          openai_key: data.openaiKey,
          deepseek_key: data.deepseekKey,
        });

      if (error) throw error;

      toast.success('API keys updated successfully');
      setApiKeys(data);
    } catch (err) {
      console.error('Error updating API keys:', err);
      toast.error('Failed to update API keys');
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
        <p className="text-gray-600">{t('settings.description')}</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setTab('general')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setTab('notifications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setTab('api-keys')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'api-keys'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setTab('subscription')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subscription'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Subscription
          </button>
        </nav>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.language')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-xs">
                  <LanguageSelector />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('settings.business.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-4">
                  <Input
                    label={t('settings.business.name')}
                    {...businessForm.register('businessName', { required: true })}
                  />
                  
                  <Input
                    label={t('settings.business.email')}
                    type="email"
                    {...businessForm.register('email', { required: true })}
                  />
                  
                  <Input
                    label={t('settings.business.phone')}
                    {...businessForm.register('phone', { required: true })}
                  />
                  
                  <Input
                    label={t('settings.business.address')}
                    {...businessForm.register('address', { required: true })}
                  />
                  
                  <Controller
                    name="timezone"
                    control={businessForm.control}
                    render={({ field }) => (
                      <Select
                        label={t('settings.timezone')}
                        options={[
                          { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
                          { value: 'America/New_York', label: 'New York (GMT-4)' },
                          { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-7)' },
                          { value: 'Europe/London', label: 'London (GMT+1)' },
                          { value: 'Europe/Paris', label: 'Paris (GMT+2)' },
                          { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit">
                      {t('common.save')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.notifications.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...notificationForm.register('emailNotifications')}
                  />
                  <label htmlFor="emailNotifications" className="text-sm text-gray-700">
                    {t('settings.notifications.email')}
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...notificationForm.register('smsNotifications')}
                  />
                  <label htmlFor="smsNotifications" className="text-sm text-gray-700">
                    {t('settings.notifications.sms')}
                  </label>
                </div>

                <Input
                  type="number"
                  label={t('settings.notifications.reminderTime')}
                  {...notificationForm.register('reminderTime', {
                    required: true,
                    min: 1,
                    max: 72,
                  })}
                />

                <div className="flex justify-end">
                  <Button type="submit">
                    {t('common.save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* API Keys Settings */}
        {activeTab === 'api-keys' && (
          <Card>
            <CardHeader>
              <CardTitle>API Keys Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={apiKeysForm.handleSubmit(onAPIKeysSubmit)} className="space-y-4">
                <Input
                  label="OpenAI API Key"
                  type="password"
                  leftIcon={<Key size={16} />}
                  {...apiKeysForm.register('openaiKey')}
                  placeholder="sk-..."
                />

                <Input
                  label="DeepSeek API Key"
                  type="password"
                  leftIcon={<Key size={16} />}
                  {...apiKeysForm.register('deepseekKey')}
                  placeholder="ds-..."
                />

                <div className="flex justify-end">
                  <Button type="submit">
                    Save API Keys
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Subscription Settings */}
        {activeTab === 'subscription' && (
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading subscription details...</div>
              ) : error ? (
                <div className="text-red-600">Error loading subscription: {error}</div>
              ) : currentPlan ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{currentPlan.name} Plan</h3>
                      <p className="text-gray-600">{currentPlan.description}</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-primary-600" />
                  </div>

                  <div className="space-y-3 mb-6">
                    {Object.entries(currentPlan.features || {}).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center text-gray-700">
                        <Check className="h-5 w-5 text-primary-500 mr-3" />
                        <span>
                          {key === 'calendars' && value === -1
                            ? 'Unlimited calendars'
                            : key === 'professionals' && value === -1
                            ? 'Unlimited professionals'
                            : key === 'appointments_per_month' && value === -1
                            ? 'Unlimited appointments'
                            : `${value} ${key.replace('_', ' ')}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {(!currentPlan.name || currentPlan.name === 'Free') && (
                    <Button onClick={handleUpgrade} className="w-full">
                      Upgrade to Business Plan
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">No active subscription found</p>
                  <Button onClick={handleUpgrade}>
                    View Available Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;