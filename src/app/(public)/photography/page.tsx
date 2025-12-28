import type { Metadata } from 'next';
import { Camera } from 'lucide-react';
import { PhotographySearch } from '~/components/photography/PhotographySearch';
import { getGalleries } from '~/server/actions/galleries';

export const metadata: Metadata = {
  title: '摄影 - BlogT3',
  description: '记录生活中的美好瞬间，分享摄影作品集',
};

export default async function PhotographyPage() {
  const result = await getGalleries({
    status: 'PUBLISHED',
    orderBy: 'publishedAt',
    order: 'desc'
  });

  const galleries = result.success ? result.data ?? [] : [];
  const count = result.count ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-base p-8 text-center onload-animation">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Camera className="h-8 w-8 text-[var(--primary)]" />
          <h1 className="text-4xl font-bold text-90">摄影作品</h1>
        </div>
        <p className="text-75 text-lg">
          用镜头捕捉世界，用光影记录生活
        </p>
      </div>

      {/* Search and Gallery */}
      <PhotographySearch
        initialGalleries={galleries}
        initialCount={count}
      />
    </div>
  );
}
