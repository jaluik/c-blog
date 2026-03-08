import Link from 'next/link';
import type { PostWithRelations } from '@blog/shared-types';

interface PostCardProps {
  post: PostWithRelations;
}

export function PostCard({ post }: PostCardProps) {
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
