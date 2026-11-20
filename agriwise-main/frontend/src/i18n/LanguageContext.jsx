import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './languages';
import { translations } from './translations';
import { api } from '../api';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'agriwise_preferred_language';

export function LanguageProvider({ children, currentUser }) {
  // Determine initial language from localStorage -> currentUser -> browser -> default
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
        return stored;
      }
      if (currentUser?.preferred_language && SUPPORTED_LANGUAGES.some(l => l.code === currentUser.preferred_language)) {
        return currentUser.preferred_language;
      }
    } catch {
      // fallback
    }
    return DEFAULT_LANGUAGE;
  });

  // Keep synced if currentUser changes (e.g., login with saved preference)
  useEffect(() => {
    if (currentUser?.preferred_language && SUPPORTED_LANGUAGES.some(l => l.code === currentUser.preferred_language)) {
      if (currentUser.preferred_language !== currentLang) {
        setCurrentLang(currentUser.preferred_language);
        try {
          localStorage.setItem(STORAGE_KEY, currentUser.preferred_language);
        } catch {
          // ignore
        }
      }
    }
  }, [currentUser]);

  // Update HTML tag lang attribute and font rendering hint
  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.setAttribute('data-agri-lang', currentLang);
  }, [currentLang]);

  // Translation function
  const t = useCallback((path, fallback = '') => {
    if (!path) return fallback;
    const parts = path.split('.');

    // 1. Try current language
    let current = translations[currentLang];
    let found = true;
    for (const p of parts) {
      if (current && typeof current === 'object' && p in current) {
        current = current[p];
      } else {
        found = false;
        break;
      }
    }
    if (found && typeof current === 'string') {
      return current;
    }

    // 2. Try English fallback
    let enCurrent = translations['en'];
    let enFound = true;
    for (const p of parts) {
      if (enCurrent && typeof enCurrent === 'object' && p in enCurrent) {
        enCurrent = enCurrent[p];
      } else {
        enFound = false;
        break;
      }
    }
    if (enFound && typeof enCurrent === 'string') {
      return enCurrent;
    }

    return fallback || path;
  }, [currentLang]);

  // Language switcher
  const changeLanguage = useCallback(async (newLangCode) => {
    if (!SUPPORTED_LANGUAGES.some(l => l.code === newLangCode)) {
      return;
    }

    setCurrentLang(newLangCode);
    try {
      localStorage.setItem(STORAGE_KEY, newLangCode);
    } catch (err) {
      console.warn('Could not save language to localStorage:', err);
    }

    // If authenticated, sync preference to user account in the database
    const token = api.getToken();
    if (token) {
      try {
        await api.updatePreferences({ preferred_language: newLangCode });
        // Update cached user object if present
        const cachedUser = api.getUser();
        if (cachedUser) {
          cachedUser.preferred_language = newLangCode;
          api.setUser(cachedUser);
        }
      } catch (err) {
        console.warn('Could not sync language preference to backend:', err);
      }
    }
  }, []);

  const currentLanguageObj = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];
  }, [currentLang]);

  const value = useMemo(() => ({
    currentLang,
    currentLanguageObj,
    setLanguage: changeLanguage,
    t,
    languages: SUPPORTED_LANGUAGES,
    greeting: currentLanguageObj.greeting
  }), [currentLang, currentLanguageObj, changeLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
