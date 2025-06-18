import { useState, useEffect } from 'react';

interface CookiePreferences {
  essential: boolean;
  performance: boolean;
  functionality: boolean;
  marketing: boolean;
  timestamp?: string;
}

export const useCookieConsent = () => {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem('cookie-consent');
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences(parsed);
        }
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadPreferences();
  }, []);

  const updatePreferences = (newPreferences: CookiePreferences) => {
    const preferencesWithTimestamp = {
      ...newPreferences,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(preferencesWithTimestamp));
    setPreferences(preferencesWithTimestamp);
  };

  const hasConsent = (type: keyof CookiePreferences): boolean => {
    if (!preferences) return false;
    return preferences[type] || false;
  };

  const clearPreferences = () => {
    localStorage.removeItem('cookie-consent');
    setPreferences(null);
  };

  return {
    preferences,
    isLoaded,
    updatePreferences,
    hasConsent,
    clearPreferences,
  };
}; 