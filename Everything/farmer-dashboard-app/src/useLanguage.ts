import { useContext } from 'react'
import { LanguageContext } from './languageContextInstance'

export function useLanguage() {
  return useContext(LanguageContext)
}
