/**
 * Language Switcher Component for ScrollUniversity Platform
 * Provides UI for users to switch between supported languages
 */

import React, { useState, useEffect } from 'react';
import { SupportedLanguage, CulturalRegion } from '../../types/multilingual';
import { MultilingualService } from '../../services/MultilingualService';

interface LanguageSwitcherProps {
  userId: string;
  onLanguageChange?: (language: SupportedLanguage) => void;
  showRegionalLanguages?: boolean;
  compact?: boolean;
}

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  region: CulturalRegion;
  isCurrentLanguage: boolean;
  isRegionalLanguage: boolean;
  flag: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  userId,
  onLanguageChange,
  showRegionalLanguages = true,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(SupportedLanguage.English);
  const [availableLanguages, setAvailableLanguages] = useState<LanguageOption[]>([]);
  const [regionalLanguages, setRegionalLanguages] = useState<LanguageOption[]>([]);
  const [rtlSupport, setRtlSupport] = useState(false);
  const [loading, setLoading] = useState(false);

  const multilingualService = MultilingualService.getInstance();

  // Language flags mapping
  const languageFlags: Record<SupportedLanguage, string> = {
    [SupportedLanguage.English]: '🇺🇸',
    [SupportedLanguage.Spanish]: '🇪🇸',
    [SupportedLanguage.Arabic]: '🇸🇦',
    [SupportedLanguage.Hebrew]: '🇮🇱',
    [SupportedLanguage.Chinese]: '🇨🇳',
    [SupportedLanguage.Twi]: '🇬🇭',
    [SupportedLanguage.Yoruba]: '🇳🇬'
  };

  useEffect(() => {
    loadLanguageInterface();
  }, [userId]);

  const loadLanguageInterface = async () => {
    try {
      const interface_ = multilingualService.getLanguageSwitchingInterface(userId);
      
      setCurrentLanguage(interface_.currentLanguage);
      setRtlSupport(interface_.rtlSupport);
      
      // Add flags to language options
      const languagesWithFlags = interface_.availableLanguages.map(lang => ({
        ...lang,
        flag: languageFlags[lang.code]
      }));
      
      const regionalWithFlags = interface_.regionalLanguages.map(lang => ({
        ...lang,
        flag: languageFlags[lang.code]
      }));
      
      setAvailableLanguages(languagesWithFlags);
      setRegionalLanguages(regionalWithFlags);
    } catch (error) {
      console.error('Failed to load language interface:', error);
    }
  };

  const handleLanguageSwitch = async (newLanguage: SupportedLanguage) => {
    if (newLanguage === currentLanguage) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      await multilingualService.switchUserLanguage(userId, newLanguage, 'ui_switcher');
      setCurrentLanguage(newLanguage);
      setIsOpen(false);
      
      if (onLanguageChange) {
        onLanguageChange(newLanguage);
      }
      
      // Reload interface to get updated RTL support
      await loadLanguageInterface();
    } catch (error) {
      console.error('Failed to switch language:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLanguageOption = () => {
    return availableLanguages.find(lang => lang.code === currentLanguage);
  };

  const getDisplayLanguages = () => {
    if (showRegionalLanguages && regionalLanguages.length > 0) {
      return regionalLanguages;
    }
    return availableLanguages;
  };

  if (compact) {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          <span className="text-lg">{getCurrentLanguageOption()?.flag}</span>
          <span>{getCurrentLanguageOption()?.name}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 z-10 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="py-1">
              {getDisplayLanguages().map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSwitch(language.code)}
                  className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                    language.isCurrentLanguage ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                  disabled={loading}
                >
                  <span className="text-lg mr-3">{language.flag}</span>
                  <span>{language.name}</span>
                  {language.isCurrentLanguage && (
                    <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`language-switcher ${rtlSupport ? 'rtl' : 'ltr'}`}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Choose Your Language / اختر لغتك / בחר את השפה שלך
        </h3>
        
        <div className="current-language mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getCurrentLanguageOption()?.flag}</span>
            <div>
              <p className="font-medium text-blue-900">Current Language</p>
              <p className="text-blue-700">{getCurrentLanguageOption()?.name}</p>
            </div>
          </div>
        </div>

        {showRegionalLanguages && regionalLanguages.length > 0 && (
          <div className="regional-languages mb-6">
            <h4 className="text-md font-medium text-gray-800 mb-3">
              Regional Languages
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {regionalLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSwitch(language.code)}
                  className={`flex items-center p-3 rounded-lg border-2 transition-colors ${
                    language.isCurrentLanguage
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={loading}
                >
                  <span className="text-xl mr-3">{language.flag}</span>
                  <span className="font-medium">{language.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="all-languages">
          <h4 className="text-md font-medium text-gray-800 mb-3">
            All Available Languages
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSwitch(language.code)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  language.isCurrentLanguage
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                disabled={loading}
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">{language.flag}</span>
                  <div className="text-left">
                    <p className="font-medium">{language.name}</p>
                    <p className="text-sm text-gray-500">
                      {language.region.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {language.isRegionalLanguage && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2">
                      Regional
                    </span>
                  )}
                  {language.isCurrentLanguage && (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Switching language...</span>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>ScrollUniversity supports global accessibility with culturally-adapted content.</p>
          <p>Your language preference will be saved for future sessions.</p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;