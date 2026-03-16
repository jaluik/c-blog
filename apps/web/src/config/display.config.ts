/**
 * 展示与分页配置
 * 控制列表、分页、ISR 等行为
 */

export const displayConfig = {
  /**
   * 分页配置
   */
  pagination: {
    /** 默认每页条数 */
    defaultPageSize: 10,
    /** 可选的每页条数 */
    pageSizeOptions: [10, 20, 50],
    /** 默认页码 */
    defaultPage: 1,
  },

  /**
   * 首页配置
   */
  home: {
    /** 精选文章数量 */
    featuredPostsCount: 3,
    /** 最新文章展示数量 */
    latestPostsCount: 8,
    /** 是否显示分类区域 */
    showCategories: true,
    /** 是否显示标签云 */
    showTags: true,
    /** 是否显示 CTA 区域 */
    showCtaSection: true,
  },

  /**
   * 文章卡片配置
   */
  postCard: {
    /** 卡片上最多显示的标签数 */
    maxTagsDisplay: 2,
    /** 是否显示阅读数 */
    showViewCount: true,
    /** 是否显示发布日期 */
    showPublishDate: true,
    /** 日期格式 */
    dateFormat: {
      /** 完整日期格式（用于大卡片） */
      full: "yyyy年MM月dd日",
      /** 简短日期格式（用于小卡片） */
      short: "MM-dd",
    },
  },

  /**
   * 精选文章配置
   */
  featured: {
    /** 精选徽章文本 */
    badgeText: "精选",
  },

  /**
   * 标签云配置
   */
  tagCloud: {
    /** 区域标题 */
    title: "通过标签发现",
    titleHighlight: "更多内容",
    /** 区域描述 */
    description: "点击标签浏览相关文章，快速定位你感兴趣的技术话题",
    /** 徽章文本 */
    badgeText: "热门标签",
    /** 最多显示的标签数 */
    maxTags: 30,
    /** 最小字体大小（px） */
    minFontSize: 12,
    /** 最大字体大小（px） */
    maxFontSize: 24,
    /** 文章数量包裹符 */
    countPrefix: "(",
    countSuffix: ")",
  },

  /**
   * 分类列表配置
   */
  categoryList: {
    /** 区域标题 */
    title: "探索不同领域的",
    titleHighlight: "技术文章",
    /** 区域描述 */
    description: "按主题分类浏览文章，找到你感兴趣的技术内容",
    /** 徽章文本 */
    badgeText: "内容分类",
    /** 每行显示的分类数 */
    itemsPerRow: {
      mobile: 2,
      tablet: 3,
      desktop: 4,
    },
    /** 文章计数后缀 */
    articleCountSuffix: "篇文章",
  },

  /**
   * ISR 配置
   */
  isr: {
    /** 首页重生成时间（秒） */
    homeRevalidate: 60,
    /** 文章列表页重生成时间（秒） */
    postsRevalidate: 60,
    /** 文章详情页重生成时间（秒） */
    postDetailRevalidate: 60,
    /** 分类页重生成时间（秒） */
    categoryRevalidate: 120,
    /** 标签页重生成时间（秒） */
    tagRevalidate: 120,
  },

  /**
   * 动画配置
   */
  animation: {
    /** 卡片入场动画延迟基数（秒） */
    cardDelayBase: 0,
    /** 卡片入场动画间隔（秒） */
    cardDelayInterval: 0.1,
    /** 动画持续时间（秒） */
    duration: 0.5,
  },

  /**
   * 相关文章配置
   */
  relatedPosts: {
    /** 最多显示的相关文章数 */
    maxCount: 3,
  },

  /**
   * SEO 配置
   */
  seo: {
    /** 默认标题模板 */
    titleTemplate: "%s | VoidCode",
    /** 默认描述长度 */
    descriptionLength: 160,
    /** 默认 OG 图片尺寸 */
    ogImage: {
      width: 1200,
      height: 630,
    },
  },
} as const;

export type DisplayConfig = typeof displayConfig;
