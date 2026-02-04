import Link from 'next/link';
import Image from 'next/image';

const ArticleListItem = ({ article }) => {
  return (
    <Link
      href={`/article/${article.id}`}
      className="flex gap-4 py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors group px-2 -mx-2 rounded"
    >
      <div className="relative w-36 h-24 flex-shrink-0 rounded-md overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="144px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-navy text-white text-[10px] rounded font-medium leading-none">
          {article.category}
        </span>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {article.stockChange !== undefined && (
          <span className={`text-xs font-bold mb-1 ${article.stockChange > 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {article.stockChange > 0 ? '▲' : '▼'} {Math.abs(article.stockChange)}%
          </span>
        )}
        <h3 className="text-sm font-bold text-navy line-clamp-2 leading-snug group-hover:text-sky-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
          {article.summary}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1.5">
          <span>{article.author}</span>
          <span>·</span>
          <span>{article.date}</span>
        </div>
      </div>
    </Link>
  );
};

export default ArticleListItem;
