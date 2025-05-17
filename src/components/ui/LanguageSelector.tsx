import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import Select from './Select';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const languages = [
    { value: 'en', label: t('settings.languages.en') },
    { value: 'pt', label: t('settings.languages.pt') },
    { value: 'es', label: t('settings.languages.es') },
  ];

  return (
    <Select
      value={language}
      options={languages}
      onChange={(value) => setLanguage(value as 'en' | 'pt' | 'es')}
      label={t('settings.language')}
    />
  );
};

export default LanguageSelector;