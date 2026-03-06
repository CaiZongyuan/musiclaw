import { describe, expect, test } from 'vitest'
import {
  getSearchLoaderDeps,
  normalizeSearchParams,
} from '../../src/routes/search'

describe('normalizeSearchParams', () => {
  test('returns defaults for undefined input', () => {
    expect(normalizeSearchParams(undefined)).toEqual({
      q: '',
      type: 1018,
    })
  })

  test('keeps valid q and type values', () => {
    expect(
      normalizeSearchParams({
        q: '周杰伦',
        type: 100,
      }),
    ).toEqual({
      q: '周杰伦',
      type: 100,
    })
  })

  test('keeps loader deps in sync with search params', () => {
    expect(
      getSearchLoaderDeps({
        q: 'Taylor Swift',
        type: 1018,
      }),
    ).toEqual({
      q: 'Taylor Swift',
      type: 1018,
    })
  })
})
