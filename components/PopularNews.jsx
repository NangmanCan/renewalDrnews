import Link from 'next/link';

const PopularNews = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="space-y-3">
      {articles.map((article, index) => (
        <Link
          key={article.id}
          href={`/article/${article.id}`}
          className="flex items-start gap-3 group"
        >
          <span className="flex-shrink-0 w-6 h-6 bg-[#0f172a] text-white text-sm font-bold rounded flex items-center justify-center">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-sky-600 transition-colors">
              {article.title}
            </h4>
            <span className="text-xs text-gray-400 mt-1">
              조회 {article.views?.toLocaleString() || 0}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PopularNews;
