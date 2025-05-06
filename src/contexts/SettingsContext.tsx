import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  timezone: string;
  setTimezone: (timezone: string) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  timezone: 'America/Sao_Paulo',
  setTimezone: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [timezone, setTimezone] = useState(() => {
    const savedTimezone = localStorage.getItem('timezone');
    return savedTimezone || 'America/Sao_Paulo';
  });

  useEffect(() => {
    localStorage.setItem('timezone', timezone);
  }, [timezone]);

  return (
    <SettingsContext.Provider value={{ timezone, setTimezone }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}