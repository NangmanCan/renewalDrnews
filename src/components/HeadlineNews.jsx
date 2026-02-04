const HeadlineNews = ({ articles, onClick }) => {
  if (!articles || articles.length === 0) return null;

  const mainArticle = articles[0];
  const subArticles = articles.slice(1, 3);

  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 메인 헤드라인 뉴스 (왼쪽 큰 영역) */}
        <button
          onClick={() => onClick(mainArticle.id)}
          className="text-left group relative overflow-hidden rounded-xl shadow-lg"
        >
          <img
            src={mainArticle.image}
            alt={mainArticle.title}
            className="w-full h-[300px] lg:h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <span className="inline-block px-2 py-1 bg-sky-600 text-white text-xs font-medium rounded mb-2">
              {mainArticle.category}
            </span>
            <h2 className="text-xl lg:text-2xl font-bold text-white mb-2 leading-tight group-hover:text-sky-300 transition-colors line-clamp-2">
              {mainArticle.title}
            </h2>
            <p className="text-gray-200 text-sm mb-2 line-clamp-2 hidden lg:block">
              {mainArticle.summary}
            </p>
            <div className="flex items-center gap-2 text-gray-300 text-xs">
              <span>{mainArticle.author}</span>
              <span>|</span>
              <span>{mainArticle.date}</span>
            </div>
          </div>
        </button>

        {/* 오른쪽 영역: 서브 뉴스 2개 + 광고 1개 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {/* 서브 뉴스 2개 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => onClick(article.id)}
                className="text-left group relative overflow-hidden rounded-xl shadow-lg"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-[150px] lg:h-[190px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="inline-block px-2 py-0.5 bg-sky-600 text-white text-xs font-medium rounded mb-1">
                    {article.category}
                  </span>
                  <h3 className="text-sm lg:text-base font-bold text-white leading-tight group-hover:text-sky-300 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                </div>
              </button>
            ))}
          </div>

          {/* 광고 슬롯 */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-lg flex items-center justify-center h-[150px] lg:h-[190px] border-2 border-dashed border-gray-300">
            <div className="text-center p-4">
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">ADVERTISEMENT</div>
              <div className="text-gray-500 text-lg font-semibold">광고 지면</div>
              <div className="text-gray-400 text-xs mt-1">문의: ad@drnews.kr</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeadlineNews;
