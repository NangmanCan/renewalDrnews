const SubArticleCard = ({ article, onClick }) => {
  return (
    <button
      onClick={() => onClick(article.id)}
      className="w-full text-left group flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="relative flex-shrink-0 w-20 h-14 overflow-hidden rounded-md">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#0f172a] text-white text-[10px] rounded leading-none font-medium">
          {article.category}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-[#0f172a] leading-tight line-clamp-2 group-hover:text-sky-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">{article.author} · {article.date}</p>
      </div>
    </button>
  );
};

export default SubArticleCard;
