import { describe, expect, test } from 'vitest'
import {
  EXPLORE_DEFAULT_CATEGORY,
  buildExploreQueueSource,
  buildVisibleExploreCategories,
  normalizeExploreCategory,
  normalizeEnabledExploreCategories,
} from '../../src/features/explore/lib/explore-helpers'

describe('explore helpers', () => {
  test('falls back to default category for unknown values', () => {
    expect(normalizeExploreCategory(undefined)).toBe(EXPLORE_DEFAULT_CATEGORY)
    expect(normalizeExploreCategory('不存在的分类')).toBe(EXPLORE_DEFAULT_CATEGORY)
  })

  test('keeps active category visible even if not enabled', () => {
    expect(buildVisibleExploreCategories(['推荐歌单'], '流行')).toEqual([
      '全部',
      '推荐歌单',
      '流行',
    ])
  })

  test('normalizes enabled category storage payloads', () => {
    expect(normalizeEnabledExploreCategories(['推荐歌单', '推荐歌单', '流行'])).toEqual([
      '推荐歌单',
      '流行',
    ])
  })

  test('builds an explore queue source with category context', () => {
    expect(buildExploreQueueSource('排行榜')).toEqual({
      label: 'Explore · 排行榜',
      to: '/explore',
      exploreCategory: '排行榜',
    })
  })
})
