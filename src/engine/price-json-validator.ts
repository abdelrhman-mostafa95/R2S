import type { PriceRow, PriceTableData, PriceTableMeta } from './types.ts'

export class PriceJsonValidationException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PriceJsonValidationException'
  }
}

const expectedColumnKeys = ['company_price', 'warehouse_price', 'pharmacy_price'] as const

export function validatePriceTable(json: unknown, expectedRowCount = 400): PriceTableData {
  if (!isRecord(json)) {
    throw new PriceJsonValidationException('Price table root must be an object.')
  }

  const columns = json.columns
  if (!isRecord(columns)) {
    throw new PriceJsonValidationException('Missing or invalid columns object.')
  }

  for (const key of expectedColumnKeys) {
    const column = columns[key]
    if (!isRecord(column)) {
      throw new PriceJsonValidationException(`Missing column: ${key}`)
    }
    const label = column.label
    if (typeof label !== 'string' || label.trim() === '') {
      throw new PriceJsonValidationException(`Missing label for column: ${key}`)
    }
  }

  const rowsJson = json.rows
  if (!Array.isArray(rowsJson)) {
    throw new PriceJsonValidationException('Missing or invalid rows list.')
  }
  if (rowsJson.length !== expectedRowCount) {
    throw new PriceJsonValidationException(
      `Expected ${expectedRowCount} rows, found ${rowsJson.length}.`,
    )
  }

  const rows: PriceRow[] = []
  for (let i = 0; i < rowsJson.length; i += 1) {
    const item = rowsJson[i]
    if (!isRecord(item)) {
      throw new PriceJsonValidationException(`Row ${i} is not an object.`)
    }
    rows.push({
      page: requireInt(item, 'page', i),
      companyPrice: requireInt(item, 'company_price', i),
      warehousePrice: requireInt(item, 'warehouse_price', i),
      pharmacyPrice: requireInt(item, 'pharmacy_price', i),
    })
  }

  const footer = json.footer
  if (!isRecord(footer)) {
    throw new PriceJsonValidationException('Missing or invalid footer metadata.')
  }

  const meta: PriceTableMeta = {
    sourceFile: optionalString(json.source_file) ?? '',
    pageCount: optionalInt(json.page_count) ?? 0,
    companyFooter: requireFooterString(footer, 'company_price'),
    warehouseFooter: requireFooterString(footer, 'warehouse_price'),
    pharmacyFooter: requireFooterString(footer, 'pharmacy_price'),
    companyLabel: (columns.company_price as Record<string, unknown>).label as string,
    warehouseLabel: (columns.warehouse_price as Record<string, unknown>).label as string,
    pharmacyLabel: (columns.pharmacy_price as Record<string, unknown>).label as string,
  }

  return { rows, meta }
}

function requireInt(row: Record<string, unknown>, key: string, index: number): number {
  const value = row[key]
  if (typeof value === 'number' && Number.isFinite(value) && value === Math.trunc(value)) {
    return value
  }
  throw new PriceJsonValidationException(
    `Row ${index} missing or invalid numeric field: ${key}`,
  )
}

function requireFooterString(footer: Record<string, unknown>, key: string): string {
  const value = footer[key]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new PriceJsonValidationException(`Missing footer metadata: ${key}`)
  }
  return value
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function optionalInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value)
  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
