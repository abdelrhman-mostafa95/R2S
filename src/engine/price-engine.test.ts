import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { PriceInputNormalizer } from './price-input-normalizer.ts'
import { validatePriceTable } from './price-json-validator.ts'
import { PriceLookupIndex } from './price-lookup-index.ts'

describe('PriceInputNormalizer', () => {
  const normalizer = new PriceInputNormalizer()

  test('parses western digits', () => {
    expect(normalizer.normalize('250')).toBe(250)
  })

  test('parses eastern arabic digits', () => {
    expect(normalizer.normalize('٢٥٠')).toBe(250)
  })

  test('parses persian digits', () => {
    expect(normalizer.normalize('۲۵۰')).toBe(250)
  })

  test('strips spaces and thousand separators', () => {
    expect(normalizer.normalize(' 1,250 ')).toBe(1250)
    expect(normalizer.normalize('1.250')).toBe(1250)
    expect(normalizer.normalize('١٬٢٥٠')).toBe(1250)
  })

  test('returns null for empty or invalid input', () => {
    expect(normalizer.normalize('')).toBeNull()
    expect(normalizer.normalize('   ')).toBeNull()
    expect(normalizer.normalize('250a')).toBeNull()
  })
})

describe('PriceLookupIndex', () => {
  const table = validatePriceTable(
    JSON.parse(readFileSync(resolve('public/price_table.json'), 'utf8')),
  )
  const index = PriceLookupIndex.fromRows(table.rows)

  test('returns multiple explicit matches for repeated value 250', () => {
    const matches = index.find(250)

    expect(matches.length).toBeGreaterThan(1)
    expect(matches.map((match) => match.matchedColumn)).toEqual(
      expect.arrayContaining(['warehouse', 'pharmacy']),
    )

    const pharmacyMatch = matches.find((match) => match.matchedColumn === 'pharmacy')
    expect(pharmacyMatch?.companyPrice).toBe(119)
    expect(pharmacyMatch?.warehousePrice).toBe(125)
    expect(pharmacyMatch?.pharmacyPrice).toBe(250)

    const warehouseMatch = matches.find((match) => match.matchedColumn === 'warehouse')
    expect(warehouseMatch?.companyPrice).toBe(238)
    expect(warehouseMatch?.warehousePrice).toBe(250)
    expect(warehouseMatch?.pharmacyPrice).toBe(500)
  })

  test('returns empty list for unknown value', () => {
    expect(index.find(1)).toEqual([])
  })
})
