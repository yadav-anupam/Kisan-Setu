import React, { useState, useEffect } from 'react'
import { LanguageContext } from './languageContextInstance'
import { LANGUAGES, TRANSLATIONS, type LanguageCode } from './translations'

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLangState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('kisan_setu_lang')
    return (saved as LanguageCode) || 'en'
  })

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLangState(lang)
    localStorage.setItem('kisan_setu_lang', lang)
  }

  useEffect(() => {
    document.documentElement.lang = currentLang
  }, [currentLang])

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        setLanguage,
        t,
        languages: LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}
