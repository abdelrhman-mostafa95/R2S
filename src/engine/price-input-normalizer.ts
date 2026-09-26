const easternArabic: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
}

const persian: Record<string, string> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
}

const ignored = new Set([' ', '\u00A0', '\u2009', '\u202F', ',', '.', '٬', '٫', '_'])

export class PriceInputNormalizer {
  normalize(input: string): number | null {
    let digits = ''

    for (const char of input) {
      if (ignored.has(char)) continue

      const eastern = easternArabic[char]
      if (eastern) {
        digits += eastern
        continue
      }

      const persianDigit = persian[char]
      if (persianDigit) {
        digits += persianDigit
        continue
      }

      if (char >= '0' && char <= '9') {
        digits += char
        continue
      }

      return null
    }

    if (digits === '') return null

    const value = Number(digits)
    if (!Number.isSafeInteger(value)) return null
    return value
  }
}
