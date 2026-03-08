import Link from 'next/link';
import type { PostWithRelations, PaginatedResponse } from '@blog/shared-types';

interface HomeProps {
  posts: PostWithRelations[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export async function getStaticProps() {
  const API_URL = process.env.API_URL || 'http://localhost:4000';
  const res = await fetch(`${API_URL}/api/posts?page=1&pageSize=10`);
  const result: PaginatedResponse<PostWithRelations> = await res.json();

  return {
    props: {
      posts: result.data,
      meta: result.meta,
    },
    revalidate: 60,
  };
}

function PostCard({ post }: { post: PostWithRelations }) {
  return (
    <article className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <Link href={`/posts/${post.slug}`}>
        <h2 className="text-xl font-semibold mb-2 hover:text-blue-600">
          {post.title}
        </h2>
      </Link>

      {post.summary && (
        <p className="text-gray-600 mb-4 line-clamp-2">{post.summary}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500">
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

        {post.viewCount > 0 && (
          <span>{post.viewCount} 阅读</span>
        )}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-2 mt-3">
          {post.tags.map(tag => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}

export default function HomePage({ posts, meta }: HomeProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">我的博客</h1>
          <p className="text-gray-600 mt-2">记录技术、分享生活</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {meta.totalPages > 1 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              第 {meta.page} 页，共 {meta.totalPages} 页
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
