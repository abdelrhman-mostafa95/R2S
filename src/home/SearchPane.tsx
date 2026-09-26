import { useEffect, useRef, useState, type ReactNode } from 'react'
import { PriceInputNormalizer } from '../engine/price-input-normalizer.ts'
import type { PriceLookupIndex } from '../engine/price-lookup-index.ts'
import type { PriceColumn, PriceMatch } from '../engine/types.ts'
import { foundCountLabel, type AppLanguage, type AppStrings } from '../i18n/strings.ts'
import './SearchPane.css'

const normalizer = new PriceInputNormalizer()

type SearchView =
  | { kind: 'idle' }
  | { kind: 'none' }
  | { kind: 'matches'; matches: PriceMatch[] }

const shortLabel: Record<PriceColumn, keyof AppStrings> = {
  company: 'companyShort',
  warehouse: 'warehouseShort',
  pharmacy: 'pharmacyShort',
}

const otherColumns: PriceColumn[] = ['company', 'warehouse', 'pharmacy']

function resolveSearch(query: string, index: PriceLookupIndex): SearchView {
  if (query.trim() === '') return { kind: 'idle' }
  const value = normalizer.normalize(query)
  if (value == null) return { kind: 'none' }
  const matches = index.find(value)
  if (matches.length === 0) return { kind: 'none' }
  return { kind: 'matches', matches }
}

function ViewSwap({ id, children }: { id: string; children: ReactNode }) {
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
    }, 260)
    return () => window.clearTimeout(timer)
  }, [id, visibleId])

  return (
    <div className={phase === 'out' ? 'search-swap search-swap--out' : 'search-swap search-swap--in'}>
      {phase === 'out' ? frozen.current : children}
    </div>
  )
}

function EmptyHint({ message }: { message: string }) {
  return (
    <div className="empty-hint">
      <span className="empty-hint__badge" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path
            d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11M12 8.5V4.8a1.5 1.5 0 0 1 3 0V12M15 9.2V7.5a1.5 1.5 0 0 1 3 0V14c0 3.2-2 6-6.2 6-2.6 0-4.2-1.2-5.1-2.6L5 14.2a1.6 1.6 0 0 1 2.5-2l1.5 1.4V7.5a1.5 1.5 0 0 1 3 0V11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p>{message}</p>
    </div>
  )
}

function ResultCard({
  match,
  strings,
  alternate,
  delay,
}: {
  match: PriceMatch
  strings: AppStrings
  alternate: boolean
  delay: number
}) {
  const others = otherColumns
    .filter((column) => column !== match.matchedColumn)
    .map((column) => ({
      column,
      value: column === 'company' ? match.companyPrice : column === 'warehouse' ? match.warehousePrice : match.pharmacyPrice,
    }))

  return (
    <article
      className={alternate ? 'result-card result-card--alt' : 'result-card'}
      style={{ animationDelay: `${delay}ms` }}
    >
      {alternate ? <span className="result-card__bar" /> : null}
      <div className="result-card__body">
        <p className="result-card__entered">{strings.matchedAs}</p>
        <h2 className="result-card__name">{strings[shortLabel[match.matchedColumn]]}</h2>
        <div className="result-card__value">
          <p className="result-card__number">{match.matchedValue}</p>
          <p className="result-card__unit">{strings.currencyUnit}</p>
        </div>
        <p className="result-card__matching">{strings.matchingPrices}</p>
        <div className="result-tiles">
          {others.map((other) => (
            <div className="result-tile" key={other.column}>
              <p className="result-tile__label">{strings[shortLabel[other.column]]}</p>
              <p className="result-tile__value">{other.value}</p>
              <p className="result-tile__unit">{strings.currencyUnit}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

export function SearchPane({
  index,
  query,
  language,
  strings,
}: {
  index: PriceLookupIndex
  query: string
  language: AppLanguage
  strings: AppStrings
}) {
  const view = resolveSearch(query, index)

  return (
    <ViewSwap id={`${view.kind}-${language}`}>
      {view.kind === 'idle' ? <EmptyHint message={strings.emptyHint} /> : null}
      {view.kind === 'none' ? <p className="no-match">{strings.noMatch}</p> : null}
      {view.kind === 'matches' ? (
        <div className="results">
          {view.matches.length > 1 ? (
            <p className="results__count">{foundCountLabel(strings, view.matches.length)}</p>
          ) : null}
          <div className="results__list">
            {view.matches.map((match, matchIndex) => (
              <ResultCard
                key={`${match.matchedColumn}-${match.matchedValue}-${matchIndex}`}
                match={match}
                strings={strings}
                alternate={matchIndex > 0}
                delay={45 * matchIndex}
              />
            ))}
          </div>
        </div>
      ) : null}
    </ViewSwap>
  )
}
