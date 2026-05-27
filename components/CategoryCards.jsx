import Link from 'next/link';
import Image from 'next/image';

function CategoryCard({ category, article }) {
  if (!article) {
    return (
      <Link
        href={`/?category=${encodeURIComponent(category)}`}
        className="flex-1 min-h-0 flex items-center px-3 border-b border-gray-100 last:border-b-0"
      >
        <div>
          <div className="text-[13px] font-bold text-brand-600 mb-1 tracking-wide">{category}</div>
          <div className="text-sm text-gray-400">기사 없음</div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/article/${article.id}`}
      className="group flex-1 min-h-0 flex items-center gap-3 px-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-brand-600 mb-1 tracking-wide">{category}</div>
        <h3 className="text-[15px] font-bold text-navy leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
          {article.title}
        </h3>
      </div>
      {article.image && (
        <div className="flex-shrink-0 w-20 h-16 relative bg-gray-100 overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      )}
    </Link>
  );
}

function AdSlot({ banner }) {
  if (!banner || !banner.image) return null;
  return (
    <a
      href={banner.link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 block relative w-full h-[68px] border-t border-gray-200 overflow-hidden hover:opacity-90 transition-opacity"
    >
      <Image
        src={banner.image}
        alt={banner.title || '광고'}
        fill
        quality={95}
        sizes="(max-width: 1024px) 100vw, 288px"
        className="object-cover"
        unoptimized={banner.image?.endsWith('.gif')}
      />
    </a>
  );
}

export default function CategoryCards({ items = [], adBanner = null }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="h-full bg-white border border-gray-200 flex flex-col">
      <div className="flex-1 flex flex-col min-h-0">
        {items.map(({ category, article }, idx) => (
          <CategoryCard
            key={article?.id ?? `${category}-${idx}`}
            category={category}
            article={article}
          />
        ))}
      </div>
      {adBanner && <AdSlot banner={adBanner} />}
    </div>
  );
}
