const ArticleListItem = ({ article, onClick }) => {
  return (
    <button
      onClick={() => onClick(article.id)}
      className="w-full text-left group flex gap-4 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors px-2 -mx-2 rounded"
    >
      {/* 좌측 직사각형 이미지 */}
      <div className="relative flex-shrink-0 w-36 h-24 overflow-hidden rounded-md">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#0f172a] text-white text-[10px] rounded leading-none font-medium">
          {article.category}
        </span>
      </div>

      {/* 우측 글 영역 */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* 주가 변동 배지 (바이오속보용) */}
        {article.stockChange !== undefined && (
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                article.stockChange > 0
                  ? 'text-red-600 bg-red-50'
                  : 'text-blue-600 bg-blue-50'
              }`}
            >
              {article.stockChange > 0 ? '▲' : '▼'} {Math.abs(article.stockChange)}%
            </span>
          </div>
        )}
        <h3 className="text-sm font-bold text-[#0f172a] line-clamp-2 leading-snug group-hover:text-sky-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
          {article.summary}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1.5">
          <span>{article.author}</span>
          <span>·</span>
          <span>{article.date}</span>
        </div>
      </div>
    </button>
  );
};

export default ArticleListItem;
