import { useState } from 'react';
import ArticleEditor from './ArticleEditor';
import MainCuration from './MainCuration';

const NewsDesk = ({ articles, setArticles, mainSlots, setMainSlots }) => {
  const [activeTab, setActiveTab] = useState('editor');

  const tabs = [
    { id: 'editor', label: '기사 작성' },
    { id: 'curation', label: '메인 큐레이션' },
  ];

  const handlePublish = (newArticle) => {
    const article = {
      ...newArticle,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      image: `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop&seed=${Date.now()}`,
      isHeadline: false,
    };
    setArticles([article, ...articles]);
    setActiveTab('curation');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">뉴스 데스크</h1>
        <p className="text-gray-600 mt-1">기사를 작성하고 메인 페이지 구성을 관리합니다.</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-xl border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-sky-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-xl shadow-sm">
        {activeTab === 'editor' && (
          <ArticleEditor onPublish={handlePublish} />
        )}
        {activeTab === 'curation' && (
          <MainCuration
            articles={articles}
            mainSlots={mainSlots}
            setMainSlots={setMainSlots}
          />
        )}
      </div>
    </div>
  );
};

export default NewsDesk;
