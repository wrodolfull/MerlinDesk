import React, { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';
import Button from './Button';
import { useCookieConsent } from '../../hooks/useCookieConsent';

interface CookieSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const CookieSettings: React.FC<CookieSettingsProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences } = useCookieConsent();
  const [localPreferences, setLocalPreferences] = useState({
    essential: true,
    performance: false,
    functionality: false,
    marketing: false,
  });

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handlePreferenceChange = (type: keyof typeof localPreferences) => {
    if (type === 'essential') return; // Não pode ser alterado
    setLocalPreferences(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSave = () => {
    updatePreferences(localPreferences);
    onClose();
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      performance: true,
      functionality: true,
      marketing: true,
    };
    updatePreferences(allAccepted);
    onClose();
  };

  const handleRejectAll = () => {
    const allRejected = {
      essential: true, // Sempre necessário
      performance: false,
      functionality: false,
      marketing: false,
    };
    updatePreferences(allRejected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Cookie className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Configurações de Cookies</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Gerencie suas preferências de cookies. Você pode alterar essas configurações a qualquer momento.
          </p>

          <div className="space-y-6">
            {/* Cookies Essenciais */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Cookies Essenciais</h3>
                  <p className="text-sm text-gray-600">Necessários para o funcionamento básico do site</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localPreferences.essential}
                    disabled
                    className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-500">Sempre ativo</span>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Autenticação e sessão do usuário</li>
                <li>• Preferências básicas do site</li>
                <li>• Segurança e funcionalidades essenciais</li>
              </ul>
            </div>

            {/* Cookies de Performance */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Cookies de Performance</h3>
                  <p className="text-sm text-gray-600">Nos ajudam a entender como você usa o site</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localPreferences.performance}
                    onChange={() => handlePreferenceChange('performance')}
                    className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Análise de uso do site (Google Analytics)</li>
                <li>• Métricas de performance</li>
                <li>• Identificação de problemas técnicos</li>
              </ul>
            </div>

            {/* Cookies de Funcionalidade */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Cookies de Funcionalidade</h3>
                  <p className="text-sm text-gray-600">Melhoram sua experiência personalizando o site</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localPreferences.functionality}
                    onChange={() => handlePreferenceChange('functionality')}
                    className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Preferências de idioma e tema</li>
                <li>• Configurações personalizadas</li>
                <li>• Lembrança de suas escolhas</li>
              </ul>
            </div>

            {/* Cookies de Marketing */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Cookies de Marketing</h3>
                  <p className="text-sm text-gray-600">Usados para publicidade e redes sociais</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localPreferences.marketing}
                    onChange={() => handlePreferenceChange('marketing')}
                    className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Integração com redes sociais</li>
                <li>• Publicidade personalizada</li>
                <li>• Remarketing e campanhas</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
            <Button
              onClick={handleSave}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Salvar Preferências
            </Button>
            <Button
              onClick={handleAcceptAll}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Aceitar Todos
            </Button>
            <Button
              onClick={handleRejectAll}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Rejeitar Todos
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieSettings; 