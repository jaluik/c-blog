import { prisma } from "./prisma";

async function main() {
  // 创建分类
  const category1 = await prisma.category.create({
    data: {
      name: "技术",
      slug: "tech",
      description: "技术文章",
      sortOrder: 1,
    },
  });

  const category2 = await prisma.category.create({
    data: {
      name: "生活",
      slug: "life",
      description: "生活随笔",
      sortOrder: 2,
    },
  });

  // 创建标签
  const tag1 = await prisma.tag.create({
    data: { name: "React", slug: "react" },
  });

  const tag2 = await prisma.tag.create({
    data: { name: "TypeScript", slug: "typescript" },
  });

  const tag3 = await prisma.tag.create({
    data: { name: "Node.js", slug: "nodejs" },
  });

  // 创建示例文章
  await prisma.article.create({
    data: {
      title: "欢迎来到我的博客",
      slug: "welcome-to-my-blog",
      content:
        "# 欢迎来到我的博客\n\n这是一篇示例文章。\n\n## 特性\n\n- Markdown 支持\n- 代码高亮\n- 评论系统",
      summary: "这是我的第一篇博客文章",
      status: "published",
      publishedAt: new Date(),
      categoryId: category1.id,
      viewCount: 0,
      tags: {
        create: [{ tagId: tag1.id }, { tagId: tag2.id }],
      },
    },
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
