import { Suspense } from 'react';
import { getPosts } from '~/server/actions/posts';
import { getGalleries } from '~/server/actions/galleries';

async function PostsSection() {
  const result = await getPosts({ status: 'PUBLISHED', limit: 5 });

  if (!result.success || !result.data) {
    return <div className="text-red-500">Failed to load posts: {result.error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Published Posts ({result.count})</h2>
      <div className="grid gap-4">
        {result.data.map((post) => (
          <div key={post.id} className="rounded-lg border p-4">
            <h3 className="text-xl font-semibold">{post.title}</h3>
            <p className="text-sm text-muted-foreground">{post.excerpt}</p>
            <div className="mt-2 flex gap-4 text-sm">
              <span>👁️ {post.viewCount} views</span>
              <span>❤️ {post.likeCount} likes</span>
              <span>💬 {post.commentCount} comments</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Slug: {post.slug} | ID: {post.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function GalleriesSection() {
  const result = await getGalleries({ status: 'PUBLISHED', limit: 5 });

  if (!result.success || !result.data) {
    return <div className="text-red-500">Failed to load galleries: {result.error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Published Galleries ({result.count})</h2>
      <div className="grid gap-4">
        {result.data.map((gallery) => (
          <div key={gallery.id} className="rounded-lg border p-4">
            <h3 className="text-xl font-semibold">{gallery.title}</h3>
            {gallery.description && (
              <p className="text-sm text-muted-foreground">{gallery.description}</p>
            )}
            <div className="mt-2 flex gap-4 text-sm">
              <span>📷 {gallery.photoCount} photos</span>
              <span>👁️ {gallery.viewCount} views</span>
              <span>❤️ {gallery.likeCount} likes</span>
            </div>
            {gallery.tags && gallery.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {gallery.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-2 text-xs text-muted-foreground">
              Slug: {gallery.slug} | ID: {gallery.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TestPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="mb-8 text-4xl font-bold">Database Test Page</h1>
      <p className="mb-8 text-muted-foreground">
        This page tests the Supabase CRUD operations. Make sure you have executed the SQL scripts
        (init.sql and seed.sql) in your Supabase database.
      </p>

      <div className="space-y-12">
        <Suspense fallback={<div>Loading posts...</div>}>
          <PostsSection />
        </Suspense>

        <Suspense fallback={<div>Loading galleries...</div>}>
          <GalleriesSection />
        </Suspense>
      </div>

      <div className="mt-12 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-6">
        <h2 className="mb-4 text-xl font-bold text-yellow-600 dark:text-yellow-400">
          Setup Instructions
        </h2>
        <ol className="list-inside list-decimal space-y-2 text-sm">
          <li>
            Open your Supabase project SQL Editor:{' '}
            <code className="rounded bg-muted px-2 py-1">
              https://supabase.com/dashboard/project/YOUR_PROJECT/sql
            </code>
          </li>
          <li>
            Execute <code className="rounded bg-muted px-2 py-1">prisma/init.sql</code> to create
            tables and schema
          </li>
          <li>
            Execute <code className="rounded bg-muted px-2 py-1">prisma/seed.sql</code> to insert
            mock data
          </li>
          <li>
            Make sure your <code className="rounded bg-muted px-2 py-1">.env</code> file has the
            correct Supabase credentials:
            <pre className="mt-2 rounded bg-muted p-3 text-xs">
              {`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
            </pre>
          </li>
          <li>Refresh this page to see the data from your Supabase database</li>
        </ol>
      </div>

      <div className="mt-8 rounded-lg border border-blue-500/50 bg-blue-500/10 p-6">
        <h2 className="mb-4 text-xl font-bold text-blue-600 dark:text-blue-400">
          Available Server Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold">Posts API</h3>
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>createPost</li>
              <li>getPostById / getPostBySlug</li>
              <li>getPosts</li>
              <li>updatePost</li>
              <li>deletePost</li>
              <li>incrementPostView</li>
              <li>getPostTags</li>
              <li>getPostComments</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Galleries API</h3>
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>createGallery</li>
              <li>getGalleryById / getGalleryBySlug</li>
              <li>getGalleries</li>
              <li>updateGallery</li>
              <li>deleteGallery</li>
              <li>incrementGalleryView</li>
              <li>getGalleryPhotos</li>
              <li>addPhotosToGallery</li>
              <li>deletePhoto</li>
              <li>updatePhotoOrder</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Likes API</h3>
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>createLike</li>
              <li>deleteLike</li>
              <li>toggleLike</li>
              <li>checkUserLiked</li>
              <li>getLikes</li>
              <li>getUserLikes</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Comments API</h3>
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>createComment</li>
              <li>getCommentById</li>
              <li>getComments</li>
              <li>getCommentReplies</li>
              <li>getPostCommentsTree</li>
              <li>updateComment</li>
              <li>deleteComment</li>
              <li>approveComment / rejectComment</li>
              <li>markAsSpam</li>
              <li>getPendingCommentsCount</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Import these server actions from:{' '}
          <code className="rounded bg-muted px-2 py-1">~/server/actions/*</code>
        </p>
      </div>
    </div>
  );
}
