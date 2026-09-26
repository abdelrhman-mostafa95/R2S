import { useLayoutEffect, useState, type ReactNode } from 'react'
import { stringsOf, textDirection, type AppLanguage, type AppStrings } from './strings.ts'

let currentLanguage: AppLanguage = 'ar'
const listeners = new Set<() => void>()

export function getLanguage(): AppLanguage {
  return currentLanguage
}

export function setLanguage(language: AppLanguage): void {
  if (language === currentLanguage) return
  currentLanguage = language
  for (const listener of listeners) listener()
}

export function useLanguage(): { language: AppLanguage; strings: AppStrings } {
  const [language, setSnapshot] = useState(currentLanguage)

  useLayoutEffect(() => {
    const listener = () => setSnapshot(currentLanguage)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  useLayoutEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = textDirection(language)
  }, [language])

  return { language, strings: stringsOf(language) }
}

export function LanguageRoot({ children }: { children: ReactNode }) {
  useLanguage()
  return children
}
