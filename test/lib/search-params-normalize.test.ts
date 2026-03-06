import { describe, expect, test } from 'vitest'
import {
  DEFAULT_SEARCH_PARAMS,
  getSearchLoaderDeps,
  normalizeSearchParams,
} from '../../src/routes/search'

describe('normalizeSearchParams', () => {
  test('returns defaults for undefined input', () => {
    expect(normalizeSearchParams(undefined)).toEqual(DEFAULT_SEARCH_PARAMS)
  })

  test('keeps valid q, type and page values', () => {
    expect(
      normalizeSearchParams({
        q: '周杰伦',
        type: 100,
        page: 3,
      }),
    ).toEqual({
      q: '周杰伦',
      type: 100,
      page: 3,
    })
  })

  test('falls back when page is invalid', () => {
    expect(
      normalizeSearchParams({
        q: 'Taylor Swift',
        type: 1,
        page: 0,
      }),
    ).toEqual({
      q: 'Taylor Swift',
      type: 1,
      page: 1,
    })
  })

  test('keeps loader deps in sync with search params', () => {
    expect(
      getSearchLoaderDeps({
        q: 'Taylor Swift',
        type: 1018,
        page: 2,
      }),
    ).toEqual({
      q: 'Taylor Swift',
      type: 1018,
      page: 2,
    })
  })
})
