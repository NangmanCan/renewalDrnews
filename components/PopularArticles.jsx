import Link from 'next/link';
import Image from 'next/image';
import { articles, bioPharmBreakingNews } from '@/data/articles';

const PopularArticles = () => {
  const allArticles = [...articles, ...bioPharmBreakingNews];
  const popular = [...allArticles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 h-full">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
        많이 본 기사
      </h3>
      <div className="flex flex-col gap-0">
        {popular.map((article, index) => (
          <Link
            key={article.id}
            href={`/article/${article.id}`}
            className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors group px-1 -mx-1 rounded"
          >
            {/* 순위 */}
            <span className={`flex-shrink-0 w-5 text-center font-bold text-sm leading-[44px] ${
              index === 0 ? 'text-red-600' : index <= 2 ? 'text-orange-500' : 'text-gray-400'
            }`}>
              {index + 1}
            </span>
            {/* 이미지 */}
            <div className="relative w-16 h-11 flex-shrink-0 rounded-md overflow-hidden">
              <Image src={article.image} alt={article.title} fill sizes="64px" className="object-cover" />
            </div>
            {/* 텍스트 */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-navy line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1">
                <span>{article.category}</span>
                <span>·</span>
                <span>{article.views.toLocaleString()}건</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularArticles;
