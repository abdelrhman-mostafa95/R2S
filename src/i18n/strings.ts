export type AppLanguage = 'ar' | 'en' | 'ckb'

export interface AppStrings {
  appName: string
  tagline: string
  searchHint: string
  emptyHint: string
  loadingTable: string
  loadFailedTitle: string
  retry: string
  companyPrice: string
  warehousePrice: string
  pharmacyPrice: string
  companyShort: string
  warehouseShort: string
  pharmacyShort: string
  currencyUnit: string
  matchedAs: string
  matchingPrices: string
  noMatch: string
  clear: string
  language: string
  foundTwice: string
  foundMultipleTimes: string
}

const appAr: AppStrings = {
  appName: 'R2S',
  tagline: 'اكتب أي سعر من الجدول…',
  searchHint: 'ادخل السعر',
  emptyHint: 'أدخل رقمًا ليظهر اسم الحقل والأسعار المقابلة فورًا',
  loadingTable: 'جاري تحميل جدول الأسعار…',
  loadFailedTitle: 'تعذر تحميل الجدول',
  retry: 'إعادة المحاولة',
  companyPrice: 'سعر البيع في الشركة / دينار',
  warehousePrice: 'سعر البيع في المذخر / دينار',
  pharmacyPrice: 'سعر البيع في الصيدلية / دينار',
  companyShort: 'الشركة',
  warehouseShort: 'المذخر',
  pharmacyShort: 'الصيدلية',
  currencyUnit: 'دينار',
  matchedAs: 'أدخلت',
  matchingPrices: 'الأسعار المقابلة',
  noMatch: 'لا توجد نتيجة لهذا الرقم',
  clear: 'مسح',
  language: 'اللغة',
  foundTwice: 'وُجد مرتين',
  foundMultipleTimes: 'وُجد {count} مرات',
}

const appEn: AppStrings = {
  appName: 'R2S',
  tagline: 'Type any price from the table…',
  searchHint: 'Enter the price',
  emptyHint: 'Enter a number to see the field name and matching prices instantly',
  loadingTable: 'Loading price table…',
  loadFailedTitle: 'Could not load the table',
  retry: 'Retry',
  companyPrice: 'Company Selling Price / IQD',
  warehousePrice: 'Warehouse Selling Price / IQD',
  pharmacyPrice: 'Pharmacy Selling Price / IQD',
  companyShort: 'Company',
  warehouseShort: 'Warehouse',
  pharmacyShort: 'Pharmacy',
  currencyUnit: 'IQD',
  matchedAs: 'You entered',
  matchingPrices: 'Matching prices',
  noMatch: 'No match for this number',
  clear: 'Clear',
  language: 'Language',
  foundTwice: 'Found twice',
  foundMultipleTimes: 'Found {count} times',
}

const appCkb: AppStrings = {
  appName: 'R2S',
  tagline: 'اكتب أي سعر من الجدول…',
  searchHint: 'ادخل السعر',
  emptyHint: 'أدخل رقما ليظهر اسم الحقل والأسعار المقابلة فورا',
  loadingTable: 'جاري تحميل جدول الأسعار…',
  loadFailedTitle: 'تعذر تحميل الجدول',
  retry: 'إعادة المحاولة',
  companyPrice: 'نرخی فرۆشتن له کۆمپانیا / دینار',
  warehousePrice: 'نرخی فرۆشتن له کۆگا / دینار',
  pharmacyPrice: 'نرخی فرۆشتن له دەرمانخانه / دینار',
  companyShort: 'کۆمپانیا',
  warehouseShort: 'کۆگا',
  pharmacyShort: 'دەرمانخانه',
  currencyUnit: 'دینار',
  matchedAs: 'أدخلت',
  matchingPrices: 'الأسعار المقابلة',
  noMatch: 'لا توجد نتيجة لهذا الرقم',
  clear: 'مسح',
  language: 'اللغة',
  foundTwice: 'وجد مرتين',
  foundMultipleTimes: 'وجد {count} مرات',
}

const catalogs: Record<AppLanguage, AppStrings> = {
  ar: appAr,
  en: appEn,
  ckb: appCkb,
}

export function stringsOf(language: AppLanguage): AppStrings {
  return catalogs[language]
}

export function foundCountLabel(strings: AppStrings, count: number): string {
  if (count === 2) return strings.foundTwice
  return strings.foundMultipleTimes.replaceAll('{count}', String(count))
}

export function textDirection(language: AppLanguage): 'rtl' | 'ltr' {
  return language === 'en' ? 'ltr' : 'rtl'
}
