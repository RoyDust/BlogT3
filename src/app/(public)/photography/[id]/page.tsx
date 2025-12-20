import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Calendar, Tag, ArrowLeft, Eye, Heart } from 'lucide-react';
import Link from 'next/link';
import { MainLayout } from '~/components/layout/MainLayout';
import { PhotoGalleryGrid } from '~/components/photography/PhotoGalleryGrid';
import { getGalleryBySlug, incrementGalleryView, getGalleryPhotos } from '~/server/actions/galleries';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getGalleryBySlug(id);

  if (!result.success || !result.data) {
    return {
      title: '摄影集未找到 - BlogT3',
    };
  }

  const gallery = result.data;

  return {
    title: `${gallery.title} - 摄影 - BlogT3`,
    description: gallery.description ?? gallery.title,
  };
}

export default async function PhotoGalleryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getGalleryBySlug(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const gallery = result.data;

  // Increment view count
  void incrementGalleryView(gallery.id);

  // Get photos
  const photosResult = await getGalleryPhotos(gallery.id);
  const photos = photosResult.success ? photosResult.data ?? [] : [];

  const formattedDate = gallery.publishedAt
    ? new Date(gallery.publishedAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date(gallery.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <MainLayout showSidebar={true}>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/photography"
          className="inline-flex items-center gap-2 text-75 hover:text-90 transition-colors onload-animation"
        >
          <ArrowLeft className="h-4 w-4" />
          返回摄影列表
        </Link>

        {/* Header */}
        <div className="card-base p-8 onload-animation" style={{ animationDelay: '50ms' }}>
          <h1 className="text-4xl font-bold text-90 mb-4">{gallery.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-75 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{formattedDate}</span>
            </div>

            {gallery.tags && gallery.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                <div className="flex gap-2">
                  {gallery.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 ml-auto text-75">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{gallery.viewCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{gallery.likeCount}</span>
              </div>
              <span>{photos.length} 张照片</span>
            </div>
          </div>

          {gallery.description && (
            <p className="text-75 text-lg leading-relaxed">{gallery.description}</p>
          )}

          {gallery.location && (
            <div className="mt-4 text-75">
              <span className="font-medium">地点：</span>
              {gallery.location}
            </div>
          )}
        </div>

        {/* Photo Gallery */}
        <div className="onload-animation" style={{ animationDelay: '100ms' }}>
          <PhotoGalleryGrid
            images={photos.map((photo) => ({
              url: photo.url,
              thumbnail: photo.thumbnail,
              alt: photo.alt ?? undefined,
              width: photo.width ?? undefined,
              height: photo.height ?? undefined,
            }))}
            title={gallery.title}
          />
        </div>
      </div>
    </MainLayout>
  );
}
