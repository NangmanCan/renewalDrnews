'use client';

import Link from 'next/link';

// HTML 태그 제거 (미리보기용)
const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

const BioPharmNews = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-white sm:border sm:border-gray-200">
      <h3 className="text-base font-extrabold text-navy px-4 py-3 border-t-2 border-navy tracking-tight">
        제약·바이오
      </h3>
      <div className="p-4 space-y-1">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/article/${article.id}`}
            className="block p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-white bg-emerald-600 px-1.5 py-0.5">
                속보
              </span>
              <span className="text-xs text-gray-400">{article.category}</span>
            </div>
            <h4 className="text-[16px] font-bold text-gray-800 line-clamp-2 leading-[1.5] hover:underline">
              {article.title}
            </h4>
            <p className="text-[13px] text-gray-500 mt-1.5 leading-[1.5] line-clamp-2">
              {stripHtml(article.summary || article.content)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BioPharmNews;
