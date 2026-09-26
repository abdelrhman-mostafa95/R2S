import { describe, expect, test } from 'vitest'
import { foundCountLabel, stringsOf } from './strings.ts'

describe('foundCountLabel', () => {
  const arabic = stringsOf('ar')

  test('uses the twice phrase for 2 and the count for other numbers', () => {
    expect(foundCountLabel(arabic, 2)).toContain('مرتين')
    expect(foundCountLabel(arabic, 3)).toContain('3')
  })
})
