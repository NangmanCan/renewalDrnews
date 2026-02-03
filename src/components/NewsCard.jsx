const NewsCard = ({ article, onClick }) => {
  return (
    <button
      onClick={() => onClick(article.id)}
      className="w-full text-left group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 px-2 py-1 bg-[#0f172a] text-white text-xs font-medium rounded">
          {article.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-[#0f172a] mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {article.summary}
        </p>
        <div className="flex items-center justify-between text-gray-400 text-xs">
          <span>{article.author}</span>
          <span>{article.date}</span>
        </div>
      </div>
    </button>
  );
};

export default NewsCard;
