import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Calendar, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { PhotoGalleryGrid } from '@/components/photography/PhotoGalleryGrid';
import { mockPhotoGalleries } from '@/lib/mock-data';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const gallery = mockPhotoGalleries.find((g) => g.id === params.id);

  if (!gallery) {
    return {
      title: '摄影集未找到 - BlogT3',
    };
  }

  return {
    title: `${gallery.title} - 摄影 - BlogT3`,
    description: gallery.description || gallery.title,
  };
}

export default function PhotoGalleryDetailPage({ params }: PageProps) {
  const gallery = mockPhotoGalleries.find((g) => g.id === params.id);

  if (!gallery) {
    notFound();
  }

  const formattedDate = gallery.date.toLocaleDateString('zh-CN', {
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

            {gallery.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                <div className="flex gap-2">
                  {gallery.tags.map((tag) => (
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

            <div className="ml-auto text-75">
              {gallery.images.length} 张照片
            </div>
          </div>

          {gallery.description && (
            <p className="text-75 text-lg leading-relaxed">{gallery.description}</p>
          )}
        </div>

        {/* Photo Gallery */}
        <div className="onload-animation" style={{ animationDelay: '100ms' }}>
          <PhotoGalleryGrid images={gallery.images} title={gallery.title} />
        </div>
      </div>
    </MainLayout>
  );
}
