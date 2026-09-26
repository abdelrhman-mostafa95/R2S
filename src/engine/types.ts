export type PriceColumn = 'company' | 'warehouse' | 'pharmacy'

export interface PriceRow {
  page: number
  companyPrice: number
  warehousePrice: number
  pharmacyPrice: number
}

export interface PriceMatch {
  row: PriceRow
  matchedColumn: PriceColumn
  matchedValue: number
  companyPrice: number
  warehousePrice: number
  pharmacyPrice: number
}

export interface PriceTableMeta {
  sourceFile: string
  pageCount: number
  companyFooter: string
  warehouseFooter: string
  pharmacyFooter: string
  companyLabel: string
  warehouseLabel: string
  pharmacyLabel: string
}

export interface PriceTableData {
  rows: PriceRow[]
  meta: PriceTableMeta
}
