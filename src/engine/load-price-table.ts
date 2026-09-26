import { PriceJsonValidationException, validatePriceTable } from './price-json-validator.ts'
import { PriceLookupIndex } from './price-lookup-index.ts'
import type { PriceTableData } from './types.ts'

export interface PriceTable extends PriceTableData {
  index: PriceLookupIndex
}

export async function loadPriceTable(): Promise<PriceTable> {
  let response: Response
  try {
    response = await fetch('/price_table.json')
  } catch {
    throw new PriceJsonValidationException('Could not load the price table.')
  }

  if (!response.ok) {
    throw new PriceJsonValidationException(
      `Could not load the price table (${response.status}).`,
    )
  }

  let decoded: unknown
  try {
    decoded = await response.json()
  } catch {
    throw new PriceJsonValidationException('Price table is not valid JSON.')
  }

  const table = validatePriceTable(decoded)
  return {
    ...table,
    index: PriceLookupIndex.fromRows(table.rows),
  }
}

let tablePromise: Promise<PriceTable> | null = null

export function startPriceTableLoad(): Promise<PriceTable> {
  if (tablePromise) return tablePromise

  const pending = loadPriceTable().then(
    (table) => table,
    (error: unknown) => {
      if (tablePromise === pending) tablePromise = null
      throw error
    },
  )
  tablePromise = pending
  return pending
}

export function reloadPriceTable(): Promise<PriceTable> {
  tablePromise = null
  return startPriceTableLoad()
}
