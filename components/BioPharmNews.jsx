'use client';

import Link from 'next/link';

const BioPharmNews = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  // 증권 관련 키워드가 있는지 체크 (시뮬레이션)
  const getStockChange = (articleId) => {
    const changes = {
      4: { company: '한미약품', change: '+2.3%', isPositive: true },
      6: { company: '삼성바이오', change: '+1.8%', isPositive: true },
    };
    return changes[articleId] || null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 px-4 pt-4 pb-3 border-b border-gray-100 flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
        바이오/제약 속보
      </h3>
      <div className="p-4 space-y-3">
        {articles.map((article) => {
          const stock = getStockChange(article.id);
          return (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-white bg-emerald-500 px-1.5 py-0.5 rounded">
                  속보
                </span>
                <span className="text-xs text-gray-400">{article.category}</span>
              </div>
              <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">
                {article.title}
              </h4>
              {stock && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">{stock.company}</span>
                  <span className={`font-bold ${stock.isPositive ? 'text-red-500' : 'text-blue-500'}`}>
                    {stock.change}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BioPharmNews;
