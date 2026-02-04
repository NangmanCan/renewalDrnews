const HeadlineNews = ({ article, onClick }) => {
  if (!article) return null;

  return (
    <button
      onClick={() => onClick(article.id)}
      className="w-full text-left group"
    >
      <div className="relative overflow-hidden rounded-2xl shadow-xl h-[340px] md:h-[420px]">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
          <span className="inline-block px-3 py-1 bg-sky-600 text-white text-sm font-medium rounded-full mb-3">
            {article.category}
          </span>
          <h1 className="text-xl md:text-3xl font-bold text-white mb-2 leading-tight group-hover:text-sky-300 transition-colors">
            {article.title}
          </h1>
          <p className="text-gray-200 text-sm md:text-base mb-3 line-clamp-2">
            {article.summary}
          </p>
          <div className="flex items-center gap-3 text-gray-300 text-xs">
            <span>{article.author}</span>
            <span>|</span>
            <span>{article.date}</span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default HeadlineNews;
