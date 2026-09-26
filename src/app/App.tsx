import { useEffect, useState } from 'react'
import { startPriceTableLoad } from '../engine/load-price-table.ts'
import { LanguageRoot } from '../i18n/language.tsx'
import { HomeScreen } from '../home/HomeScreen.tsx'
import { SplashOverlay } from '../splash/SplashOverlay.tsx'

export function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    void startPriceTableLoad().catch(() => undefined)
  }, [])

  return (
    <LanguageRoot>
      <HomeScreen />
      {showSplash ? <SplashOverlay onFinished={() => setShowSplash(false)} /> : null}
    </LanguageRoot>
  )
}
