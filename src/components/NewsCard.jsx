const NewsCard = ({ article, onClick }) => {
  return (
    <button
      onClick={() => onClick(article.id)}
      className="w-full text-left group bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 py-4 px-2"
    >
      <div className="flex gap-4">
        {/* 작은 썸네일 이미지 */}
        <div className="flex-shrink-0">
          <img
            src={article.image}
            alt={article.title}
            className="w-24 h-20 object-cover rounded"
          />
        </div>

        {/* 텍스트 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-[#0f172a] text-white text-xs font-medium rounded">
              {article.category}
            </span>
            <span className="text-gray-400 text-xs">{article.date}</span>
          </div>
          <h3 className="text-base font-bold text-[#0f172a] mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">
            {article.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {article.summary}
          </p>
        </div>
      </div>
    </button>
  );
};

export default NewsCard;
