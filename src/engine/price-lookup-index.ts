import type { PriceColumn, PriceMatch, PriceRow } from './types.ts'

function matchedValue(row: PriceRow, column: PriceColumn): number {
  if (column === 'company') return row.companyPrice
  if (column === 'warehouse') return row.warehousePrice
  return row.pharmacyPrice
}

function toMatch(row: PriceRow, matchedColumn: PriceColumn): PriceMatch {
  return {
    row,
    matchedColumn,
    matchedValue: matchedValue(row, matchedColumn),
    companyPrice: row.companyPrice,
    warehousePrice: row.warehousePrice,
    pharmacyPrice: row.pharmacyPrice,
  }
}

export class PriceLookupIndex {
  private constructor(private readonly map: Map<number, PriceMatch[]>) {}

  static fromRows(rows: readonly PriceRow[]): PriceLookupIndex {
    const map = new Map<number, PriceMatch[]>()

    const add = (value: number, row: PriceRow, column: PriceColumn) => {
      const existing = map.get(value)
      const match = toMatch(row, column)
      if (existing) existing.push(match)
      else map.set(value, [match])
    }

    for (const row of rows) {
      add(row.companyPrice, row, 'company')
      add(row.warehousePrice, row, 'warehouse')
      add(row.pharmacyPrice, row, 'pharmacy')
    }

    return new PriceLookupIndex(map)
  }

  find(value: number): PriceMatch[] {
    const matches = this.map.get(value)
    if (!matches) return []
    return matches.slice()
  }

  contains(value: number): boolean {
    return this.map.has(value)
  }

  get uniqueValueCount(): number {
    return this.map.size
  }
}
