import { describe, expect, test } from 'vitest'

function ensureArray<TItem>(value: unknown): TItem[] {
  return Array.isArray(value) ? (value as TItem[]) : []
}

describe('ensureArray', () => {
  test('returns the original array when value is an array', () => {
    expect(ensureArray([{ id: 1 }])).toEqual([{ id: 1 }])
  })

  test('returns an empty array when value is undefined', () => {
    expect(ensureArray(undefined)).toEqual([])
  })

  test('returns an empty array when value is an object', () => {
    expect(ensureArray({ artists: [] })).toEqual([])
  })
})
