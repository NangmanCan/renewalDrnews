'use client';

import Link from 'next/link';

const BioPharmNews = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-white sm:border sm:border-gray-200">
      <h3 className="text-sm font-bold text-gray-900 px-4 py-3 border-b-2 border-navy flex items-center gap-2">
        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
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
              <span className="text-[10px] font-bold text-white bg-emerald-600 px-1.5 py-0.5">
                속보
              </span>
              <span className="text-xs text-gray-400">{article.category}</span>
            </div>
            <h4 className="text-[15px] font-bold text-gray-800 line-clamp-2 leading-[1.5] hover:underline">
              {article.title}
            </h4>
            <p className="text-[13px] text-gray-500 mt-1.5 leading-[1.5] line-clamp-2">
              {article.summary || article.content?.substring(0, 80)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BioPharmNews;
