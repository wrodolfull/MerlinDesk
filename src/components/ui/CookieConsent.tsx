import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Cookie, Settings } from 'lucide-react';
import Button from './Button';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Sempre true, não pode ser desabilitado
    performance: false,
    functionality: false,
    marketing: false,
  });

  useEffect(() => {
    // Verificar se o usuário já deu consentimento
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      essential: true,
      performance: true,
      functionality: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    const consent = {
      essential: true, // Sempre necessário
      performance: false,
      functionality: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const handlePreferenceChange = (type: keyof typeof preferences) => {
    if (type === 'essential') return; // Não pode ser alterado
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay para quando as configurações estão abertas */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
      )}

      {/* Banner principal */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 transition-all duration-300 ${
        showSettings ? 'transform translate-y-full' : ''
      }`}>
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0">
                <Cookie className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Usamos cookies para melhorar sua experiência
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Utilizamos cookies essenciais para o funcionamento do site e cookies opcionais para 
                  melhorar sua experiência. Você pode escolher quais aceitar.
                  <Link to="/cookies" className="text-blue-600 hover:underline ml-1">
                    Saiba mais
                  </Link>
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              onClick={handleAcceptAll}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Aceitar todos
            </Button>
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Personalizar
            </Button>
            <Button
              onClick={handleRejectAll}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Rejeitar todos
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de configurações */}
      {showSettings && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Configurações de Cookies</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

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
                      checked={preferences.essential}
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
                      checked={preferences.performance}
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
                      checked={preferences.functionality}
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
                      checked={preferences.marketing}
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
                onClick={handleAcceptSelected}
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent; 