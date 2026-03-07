import type { PlayerQueueSource } from '#/features/player/stores/player-store'

export interface ExploreCategoryOption {
  name: string
  enabledByDefault: boolean
  bigCat: 'static' | '语种' | '风格' | '场景' | '情感' | '主题'
}

export const EXPLORE_DEFAULT_CATEGORY = '全部'
export const EXPLORE_CATEGORY_STORAGE_KEY = 'music-claw:explore:categories'
export const EXPLORE_BIG_CATEGORIES = ['语种', '风格', '场景', '情感', '主题'] as const

export const exploreCategoryOptions: ExploreCategoryOption[] = [
  { name: '全部', enabledByDefault: true, bigCat: 'static' },
  { name: '推荐歌单', enabledByDefault: true, bigCat: 'static' },
  { name: '精品歌单', enabledByDefault: true, bigCat: 'static' },
  { name: '官方', enabledByDefault: true, bigCat: 'static' },
  { name: '排行榜', enabledByDefault: true, bigCat: 'static' },
  { name: '华语', enabledByDefault: false, bigCat: '语种' },
  { name: '欧美', enabledByDefault: true, bigCat: '语种' },
  { name: '日语', enabledByDefault: false, bigCat: '语种' },
  { name: '韩语', enabledByDefault: false, bigCat: '语种' },
  { name: '粤语', enabledByDefault: false, bigCat: '语种' },
  { name: '流行', enabledByDefault: true, bigCat: '风格' },
  { name: '摇滚', enabledByDefault: true, bigCat: '风格' },
  { name: '民谣', enabledByDefault: false, bigCat: '风格' },
  { name: '电子', enabledByDefault: true, bigCat: '风格' },
  { name: '舞曲', enabledByDefault: false, bigCat: '风格' },
  { name: '说唱', enabledByDefault: true, bigCat: '风格' },
  { name: '轻音乐', enabledByDefault: false, bigCat: '风格' },
  { name: '爵士', enabledByDefault: false, bigCat: '风格' },
  { name: '乡村', enabledByDefault: false, bigCat: '风格' },
  { name: 'R&B/Soul', enabledByDefault: false, bigCat: '风格' },
  { name: '古典', enabledByDefault: false, bigCat: '风格' },
  { name: '民族', enabledByDefault: false, bigCat: '风格' },
  { name: '英伦', enabledByDefault: false, bigCat: '风格' },
  { name: '金属', enabledByDefault: false, bigCat: '风格' },
  { name: '朋克', enabledByDefault: false, bigCat: '风格' },
  { name: '蓝调', enabledByDefault: false, bigCat: '风格' },
  { name: '雷鬼', enabledByDefault: false, bigCat: '风格' },
  { name: '世界音乐', enabledByDefault: false, bigCat: '风格' },
  { name: '拉丁', enabledByDefault: false, bigCat: '风格' },
  { name: 'New Age', enabledByDefault: false, bigCat: '风格' },
  { name: '古风', enabledByDefault: false, bigCat: '风格' },
  { name: '后摇', enabledByDefault: false, bigCat: '风格' },
  { name: 'Bossa Nova', enabledByDefault: false, bigCat: '风格' },
  { name: '清晨', enabledByDefault: false, bigCat: '场景' },
  { name: '夜晚', enabledByDefault: false, bigCat: '场景' },
  { name: '学习', enabledByDefault: false, bigCat: '场景' },
  { name: '工作', enabledByDefault: false, bigCat: '场景' },
  { name: '午休', enabledByDefault: false, bigCat: '场景' },
  { name: '下午茶', enabledByDefault: false, bigCat: '场景' },
  { name: '地铁', enabledByDefault: false, bigCat: '场景' },
  { name: '驾车', enabledByDefault: false, bigCat: '场景' },
  { name: '运动', enabledByDefault: false, bigCat: '场景' },
  { name: '旅行', enabledByDefault: false, bigCat: '场景' },
  { name: '散步', enabledByDefault: false, bigCat: '场景' },
  { name: '酒吧', enabledByDefault: false, bigCat: '场景' },
  { name: '怀旧', enabledByDefault: false, bigCat: '情感' },
  { name: '清新', enabledByDefault: false, bigCat: '情感' },
  { name: '浪漫', enabledByDefault: false, bigCat: '情感' },
  { name: '伤感', enabledByDefault: false, bigCat: '情感' },
  { name: '治愈', enabledByDefault: false, bigCat: '情感' },
  { name: '放松', enabledByDefault: false, bigCat: '情感' },
  { name: '孤独', enabledByDefault: false, bigCat: '情感' },
  { name: '感动', enabledByDefault: false, bigCat: '情感' },
  { name: '兴奋', enabledByDefault: false, bigCat: '情感' },
  { name: '快乐', enabledByDefault: false, bigCat: '情感' },
  { name: '安静', enabledByDefault: false, bigCat: '情感' },
  { name: '思念', enabledByDefault: false, bigCat: '情感' },
  { name: '综艺', enabledByDefault: false, bigCat: '主题' },
  { name: '影视原声', enabledByDefault: false, bigCat: '主题' },
  { name: 'ACG', enabledByDefault: true, bigCat: '主题' },
  { name: '儿童', enabledByDefault: false, bigCat: '主题' },
  { name: '校园', enabledByDefault: false, bigCat: '主题' },
  { name: '游戏', enabledByDefault: false, bigCat: '主题' },
  { name: '70后', enabledByDefault: false, bigCat: '主题' },
  { name: '80后', enabledByDefault: false, bigCat: '主题' },
  { name: '90后', enabledByDefault: false, bigCat: '主题' },
  { name: '网络歌曲', enabledByDefault: false, bigCat: '主题' },
  { name: 'KTV', enabledByDefault: false, bigCat: '主题' },
  { name: '经典', enabledByDefault: false, bigCat: '主题' },
  { name: '翻唱', enabledByDefault: false, bigCat: '主题' },
  { name: '吉他', enabledByDefault: false, bigCat: '主题' },
  { name: '钢琴', enabledByDefault: false, bigCat: '主题' },
  { name: '器乐', enabledByDefault: false, bigCat: '主题' },
  { name: '榜单', enabledByDefault: false, bigCat: '主题' },
  { name: '00后', enabledByDefault: false, bigCat: '主题' },
]

const exploreCategoryNameSet = new Set(exploreCategoryOptions.map((item) => item.name))

export function getDefaultEnabledExploreCategories() {
  return exploreCategoryOptions
    .filter((item) => item.enabledByDefault)
    .map((item) => item.name)
}

export function normalizeExploreCategory(category: unknown) {
  if (typeof category !== 'string' || !exploreCategoryNameSet.has(category)) {
    return EXPLORE_DEFAULT_CATEGORY
  }

  return category
}

export function normalizeEnabledExploreCategories(value: unknown) {
  if (!Array.isArray(value)) {
    return getDefaultEnabledExploreCategories()
  }

  const filtered = value.filter(
    (item): item is string =>
      typeof item === 'string' && exploreCategoryNameSet.has(item),
  )

  const deduped = Array.from(new Set(filtered))

  return deduped.length > 0 ? deduped : getDefaultEnabledExploreCategories()
}

export function buildVisibleExploreCategories(
  enabledCategories: string[],
  activeCategory: string,
) {
  return Array.from(new Set([EXPLORE_DEFAULT_CATEGORY, ...enabledCategories, activeCategory]))
}

export function buildExploreQueueSource(category: string): PlayerQueueSource {
  return {
    label: `Explore · ${category}`,
    to: '/explore',
    exploreCategory: category,
  }
}
