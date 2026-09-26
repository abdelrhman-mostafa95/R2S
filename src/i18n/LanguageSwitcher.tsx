import { useEffect, useId, useRef, useState } from 'react'
import { setLanguage, useLanguage } from './language.tsx'
import type { AppLanguage } from './strings.ts'
import './LanguageSwitcher.css'

const options: { language: AppLanguage; code: string; label: string }[] = [
  { language: 'ar', code: 'AR', label: 'العربية' },
  { language: 'en', code: 'EN', label: 'English' },
  { language: 'ckb', code: 'KU', label: 'کوردی' },
]

const codes: Record<AppLanguage, string> = {
  ar: 'AR',
  en: 'EN',
  ckb: 'KU',
}

export function LanguageSwitcher() {
  const { language, strings } = useLanguage()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const choose = (next: AppLanguage) => {
    setOpen(false)
    setLanguage(next)
  }

  return (
    <div className="language-switcher" ref={rootRef}>
      <button
        type="button"
        className="language-switcher__button"
        aria-label={strings.language}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="language-switcher__code">{codes[language]}</span>
        <svg className="language-switcher__arrow" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M4.5 7 L9 11.5 L13.5 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div className="language-switcher__menu" id={menuId} role="menu">
          {options.map((option) => (
            <button
              key={option.language}
              type="button"
              className="language-switcher__option"
              role="menuitem"
              onClick={() => choose(option.language)}
            >
              <span className="language-switcher__option-code">{option.code}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
