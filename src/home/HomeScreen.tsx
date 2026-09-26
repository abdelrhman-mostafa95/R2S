import { useEffect, useRef, useState, type ReactNode } from 'react'
import { reloadPriceTable, startPriceTableLoad } from '../engine/load-price-table.ts'
import type { PriceLookupIndex } from '../engine/price-lookup-index.ts'
import { useLanguage } from '../i18n/language.tsx'
import { LanguageSwitcher } from '../i18n/LanguageSwitcher.tsx'
import { SearchPane } from './SearchPane.tsx'
import './HomeScreen.css'

const allowedPrice = /^[\d\u0660-\u0669\u06F0-\u06F9\s,.\u066B\u066C_]*$/

type TableState =
  | { status: 'loading' }
  | { status: 'ready'; index: PriceLookupIndex }
  | { status: 'failure'; message: string }

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  return String(error)
}

function usePriceTable(): { state: TableState; retry: () => void } {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<TableState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    const pending = attempt === 0 ? startPriceTableLoad() : reloadPriceTable()
    pending.then(
      (table) => {
        if (!cancelled) setState({ status: 'ready', index: table.index })
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: 'failure', message: errorMessage(error) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [attempt])

  return {
    state,
    retry: () => setAttempt((value) => value + 1),
  }
}

function StatusSwap({ id, children }: { id: string; children: ReactNode }) {
  const latest = useRef(children)
  const frozen = useRef(children)
  const [visibleId, setVisibleId] = useState(id)
  const [phase, setPhase] = useState<'in' | 'out'>('in')
  latest.current = children
  if (phase === 'in' && id === visibleId) frozen.current = children

  useEffect(() => {
    if (id === visibleId) return
    setPhase('out')
    const timer = window.setTimeout(() => {
      frozen.current = latest.current
      setVisibleId(id)
      setPhase('in')
    }, 280)
    return () => window.clearTimeout(timer)
  }, [id, visibleId])

  return (
    <div className={phase === 'out' ? 'status-swap status-swap--out' : 'status-swap status-swap--in'}>
      {phase === 'out' ? frozen.current : children}
    </div>
  )
}

export function HomeScreen() {
  const { language, strings } = useLanguage()
  const { state, retry } = usePriceTable()
  const [query, setQuery] = useState('')
  const ready = state.status === 'ready'

  const onQuery = (value: string) => {
    if (!allowedPrice.test(value)) return
    setQuery(value)
  }

  return (
    <main className="home">
      <div className="home__column">
        <div className="home__logo-row">
          <img
            className="home__logo"
            src="/images/R2S_logo-removebg.png"
            alt="R2S"
            height={52}
          />
        </div>
        <div className={ready ? 'home__field-wrap' : 'home__field-wrap home__field-wrap--locked'}>
          <div className="home__field-enter">
            <div className="search-box">
              <svg className="search-box__icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M16 16 L20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                className="search-field"
                value={query}
                placeholder={strings.searchHint}
                aria-label={strings.searchHint}
                inputMode="numeric"
                autoComplete="off"
                autoCorrect="off"
                disabled={!ready}
                enterKeyHint="search"
                onChange={(event) => onQuery(event.target.value)}
              />
              {query !== '' ? (
                <button
                  type="button"
                  className="search-box__clear"
                  aria-label={strings.clear}
                  title={strings.clear}
                  onClick={() => setQuery('')}
                >
                  ×
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <div className="home__results">
          <StatusSwap id={state.status}>
            {state.status === 'loading' ? (
              <div className="table-status">
                <span className="table-status__spinner" aria-hidden="true" />
                <p>{strings.loadingTable}</p>
              </div>
            ) : null}
            {state.status === 'failure' ? (
              <div className="table-status">
                <p className="table-status__title">{strings.loadFailedTitle}</p>
                <p className="table-status__message">{state.message}</p>
                <button type="button" className="table-status__retry" onClick={retry}>
                  {strings.retry}
                </button>
              </div>
            ) : null}
            {state.status === 'ready' ? (
              <SearchPane index={state.index} query={query} language={language} strings={strings} />
            ) : null}
          </StatusSwap>
        </div>
      </div>
      <LanguageSwitcher />
    </main>
  )
}
