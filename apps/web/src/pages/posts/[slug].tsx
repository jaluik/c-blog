import type { GetStaticProps, GetStaticPaths } from 'next';
import type { PostWithRelations } from '@blog/shared-types';
import Link from 'next/link';
import { api } from '@/lib/api';
import { MarkdownContent } from '@/components/MarkdownContent';

interface PostPageProps {
  post: PostWithRelations;
}

export const getStaticPaths: GetStaticPaths = async () => {
  // 构建时预渲染所有文章
  const { data } = await api.posts.list(1, 100);
  const paths = data.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: 'blocking', // 新文章 ISR
  };
};

export const getStaticProps: GetStaticProps<{ post: PostWithRelations }> = async ({ params }) => {
  try {
    const post = await api.posts.get(params?.slug as string);
    return {
      props: { post },
      revalidate: 60, // ISR: 每分钟重新生成
    };
  } catch {
    return {
      notFound: true,
    };
  }
};

export default function PostPage({ post }: PostPageProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← 返回首页
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 text-gray-500">
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('zh-CN')}
              </time>

              {post.category && (
                <Link
                  href={`/categories/${post.category.slug}`}
                  className="text-blue-600 hover:underline"
                >
                  {post.category.name}
                </Link>
              )}

              <span>{post.viewCount} 阅读</span>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 mt-4">
                {post.tags.map(tag => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="text-sm bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg mb-8"
            />
          )}

          <MarkdownContent content={post.content} />
        </article>
      </main>
    </div>
  );
}
