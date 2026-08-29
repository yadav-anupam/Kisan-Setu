import { createContext } from 'react'
import { LANGUAGES, TRANSLATIONS, type LanguageCode, type LanguageOption, type Translations } from './translations'

export interface LanguageContextType {
  currentLang: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: Translations
  languages: LanguageOption[]
}

export const LanguageContext = createContext<LanguageContextType>({
  currentLang: 'en',
  setLanguage: () => {},
  t: TRANSLATIONS.en,
  languages: LANGUAGES,
})
