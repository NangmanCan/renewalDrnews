const MainCuration = ({ articles, mainSlots, setMainSlots }) => {
  const handleSetHeadline = (articleId) => {
    const article = articles.find((a) => a.id === articleId);
    if (article) {
      setMainSlots((prev) => ({
        ...prev,
        headline: article,
      }));
    }
  };

  const handleAddToSub = (articleId) => {
    const article = articles.find((a) => a.id === articleId);
    if (!article) return;

    if (mainSlots.sub.length >= 3) {
      alert('서브 슬롯은 최대 3개까지만 추가할 수 있습니다.');
      return;
    }

    if (mainSlots.sub.some((a) => a.id === articleId)) {
      alert('이미 서브 슬롯에 추가된 기사입니다.');
      return;
    }

    if (mainSlots.headline?.id === articleId) {
      alert('헤드라인에 설정된 기사입니다.');
      return;
    }

    setMainSlots((prev) => ({
      ...prev,
      sub: [...prev.sub, article],
    }));
  };

  const handleRemoveHeadline = () => {
    setMainSlots((prev) => ({
      ...prev,
      headline: null,
    }));
  };

  const handleRemoveSub = (articleId) => {
    setMainSlots((prev) => ({
      ...prev,
      sub: prev.sub.filter((a) => a.id !== articleId),
    }));
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Article List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            전체 기사 리스트
            <span className="text-sm font-normal text-gray-500">({articles.length}개)</span>
          </h3>
          <div className="border border-gray-200 rounded-lg max-h-[600px] overflow-y-auto">
            {articles.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                등록된 기사가 없습니다.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {articles.map((article) => {
                  const isHeadline = mainSlots.headline?.id === article.id;
                  const isSub = mainSlots.sub.some((a) => a.id === article.id);

                  return (
                    <li key={article.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {article.category}
                            </span>
                            {isHeadline && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded font-medium">
                                헤드라인
                              </span>
                            )}
                            {isSub && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded font-medium">
                                서브
                              </span>
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900 truncate">
                            {article.title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {article.author} · {article.date}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleSetHeadline(article.id)}
                            disabled={isHeadline}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                              isHeadline
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                          >
                            헤드라인
                          </button>
                          <button
                            onClick={() => handleAddToSub(article.id)}
                            disabled={isSub || isHeadline}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                              isSub || isHeadline
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            }`}
                          >
                            서브 추가
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Right: Main Page Slots */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            메인 페이지 슬롯
          </h3>

          {/* Headline Slot */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">헤드라인 (1개)</h4>
            <div className="border-2 border-dashed border-red-200 rounded-lg p-4 bg-red-50/30 min-h-[100px]">
              {mainSlots.headline ? (
                <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-red-600 font-medium">헤드라인</span>
                    <h5 className="font-medium text-gray-900 truncate">{mainSlots.headline.title}</h5>
                    <p className="text-sm text-gray-500">{mainSlots.headline.category}</p>
                  </div>
                  <button
                    onClick={handleRemoveHeadline}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  기사를 헤드라인으로 설정하세요
                </div>
              )}
            </div>
          </div>

          {/* Sub Slots */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">서브 기사 (최대 3개)</h4>
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 bg-blue-50/30 min-h-[200px]">
              {mainSlots.sub.length > 0 ? (
                <div className="space-y-2">
                  {mainSlots.sub.map((article, index) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-blue-600 font-medium">서브 {index + 1}</span>
                        <h5 className="font-medium text-gray-900 truncate">{article.title}</h5>
                        <p className="text-sm text-gray-500">{article.category}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveSub(article.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {mainSlots.sub.length < 3 && (
                    <div className="flex items-center justify-center h-12 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
                      {3 - mainSlots.sub.length}개 슬롯 남음
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  기사를 서브로 추가하세요
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainCuration;
