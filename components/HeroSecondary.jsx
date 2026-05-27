import Link from 'next/link';
import Image from 'next/image';

// 3컬럼 hero의 좌측: 보조 헤드라인 1건(이미지+제목+부제목) + 미니 헤드라인 2~3건(텍스트)
export default function HeroSecondary({ feature, mini = [] }) {
  return (
    <div className="h-full flex flex-col">
      {/* 보조 헤드라인 카드 */}
      {feature && (
        <Link href={`/article/${feature.id}`} className="group block">
          {feature.image && (
            <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                sizes="(max-width: 1024px) 100vw, 256px"
                className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          )}
          <div className="mt-3">
            {feature.category && (
              <div className="text-[13px] font-bold text-brand-600 mb-1.5 tracking-wide">
                {feature.category}
              </div>
            )}
            <h2 className="text-[19px] font-extrabold text-navy leading-tight line-clamp-3 group-hover:text-brand-600 transition-colors">
              {feature.title}
            </h2>
          </div>
        </Link>
      )}

      {/* 미니 헤드라인 (불릿 텍스트) — 남는 공간 채우기 */}
      {mini.length > 0 && (
        <ul className="border-t border-gray-200 pt-3 mt-3 space-y-2.5 flex-1">
          {mini.map((a) => (
            <li key={a.id}>
              <Link
                href={`/article/${a.id}`}
                className="group flex items-start gap-2 text-[15px] text-navy hover:text-brand-600 transition-colors"
              >
                <span className="text-brand-600 mt-0.5 flex-shrink-0">·</span>
                <span className="font-semibold leading-snug line-clamp-2">{a.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
