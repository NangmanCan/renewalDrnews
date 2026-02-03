'use client';

import { useState } from 'react';
import Link from 'next/link';
import { articles as initialArticles } from '@/data/articles';

// 사이드바 컴포넌트
function AdminSidebar({ currentMenu, setCurrentMenu }) {
  const menuItems = [
    { id: 'newsdesk', label: '뉴스 데스크', icon: '📰' },
    { id: 'ads', label: '광고 관리자', icon: '📊' },
  ];

  return (
    <aside className="w-64 bg-navy min-h-screen p-4">
      <div className="mb-8">
        <Link href="/" className="text-xl font-bold text-white">
          Dr.News
        </Link>
        <p className="text-gray-400 text-sm mt-1">관리자 페이지</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentMenu(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentMenu === item.id
                ? 'bg-sky-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t border-slate-700">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          사이트로 돌아가기
        </Link>
      </div>
    </aside>
  );
}

// 기사 작성 에디터
function ArticleEditor({ onPublish }) {
  const [form, setForm] = useState({
    title: '',
    category: '정책',
    author: '',
    summary: '',
    content: '',
  });

  const categories = ['정책', '학술', '병원', '산업'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert('제목과 본문을 입력해주세요.');
      return;
    }
    onPublish(form);
    setForm({ title: '', category: '정책', author: '', summary: '', content: '' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">기사 작성</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="기사 제목을 입력하세요"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">기자명</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="기자명"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">요약</label>
          <input
            type="text"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="기사 요약을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">본문</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
            placeholder="기사 본문을 입력하세요"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors"
        >
          발행하기
        </button>
      </form>
    </div>
  );
}

// 메인 큐레이션
function MainCuration({ articles, mainSlots, setMainSlots }) {
  const setHeadline = (article) => {
    setMainSlots({ ...mainSlots, headline: article });
  };

  const addToSub = (article) => {
    if (mainSlots.sub.length >= 3) {
      alert('서브 슬롯은 최대 3개까지 가능합니다.');
      return;
    }
    if (mainSlots.sub.find((a) => a.id === article.id)) {
      alert('이미 서브에 추가된 기사입니다.');
      return;
    }
    setMainSlots({ ...mainSlots, sub: [...mainSlots.sub, article] });
  };

  const removeFromHeadline = () => {
    setMainSlots({ ...mainSlots, headline: null });
  };

  const removeFromSub = (articleId) => {
    setMainSlots({
      ...mainSlots,
      sub: mainSlots.sub.filter((a) => a.id !== articleId),
    });
  };

  const isInSlot = (articleId) => {
    if (mainSlots.headline?.id === articleId) return 'headline';
    if (mainSlots.sub.find((a) => a.id === articleId)) return 'sub';
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">메인 큐레이션</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 전체 기사 리스트 */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-4">전체 기사 리스트</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {articles.map((article) => {
              const slot = isInSlot(article.id);
              return (
                <div
                  key={article.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {article.category}
                        </span>
                        {slot === 'headline' && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">
                            헤드라인
                          </span>
                        )}
                        {slot === 'sub' && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                            서브
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 truncate">{article.title}</p>
                      <p className="text-sm text-gray-500">{article.date}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setHeadline(article)}
                        className="text-xs px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                      >
                        헤드라인
                      </button>
                      <button
                        onClick={() => addToSub(article)}
                        className="text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                      >
                        서브 추가
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 메인 페이지 슬롯 */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-4">메인 페이지 슬롯</h3>

          {/* 헤드라인 슬롯 */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">헤드라인 (1개)</p>
            <div className="p-4 border-2 border-dashed border-red-300 rounded-lg min-h-[100px] bg-red-50">
              {mainSlots.headline ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">
                      {mainSlots.headline.category}
                    </span>
                    <p className="font-medium text-gray-900 mt-1">{mainSlots.headline.title}</p>
                  </div>
                  <button
                    onClick={removeFromHeadline}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-6">헤드라인을 선택하세요</p>
              )}
            </div>
          </div>

          {/* 서브 슬롯 */}
          <div>
            <p className="text-sm text-gray-500 mb-2">서브 (최대 3개)</p>
            <div className="space-y-2">
              {[0, 1, 2].map((index) => {
                const article = mainSlots.sub[index];
                return (
                  <div
                    key={index}
                    className="p-3 border-2 border-dashed border-blue-300 rounded-lg min-h-[60px] bg-blue-50"
                  >
                    {article ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                            {article.category}
                          </span>
                          <p className="font-medium text-gray-900 mt-1 text-sm">{article.title}</p>
                        </div>
                        <button
                          onClick={() => removeFromSub(article.id)}
                          className="p-1 hover:bg-blue-100 rounded transition-colors"
                        >
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center text-sm py-2">슬롯 {index + 1}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 광고 관리자 (Placeholder)
function AdManager() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12">
      <div className="text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📊</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">준비 중입니다</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          광고 관리 기능은 현재 개발 중입니다.
        </p>
      </div>
    </div>
  );
}

// 뉴스 데스크
function NewsDesk({ articles, setArticles, mainSlots, setMainSlots }) {
  const [activeTab, setActiveTab] = useState('curation');

  const handlePublish = (form) => {
    const newArticle = {
      id: Date.now(),
      ...form,
      date: new Date().toISOString().split('T')[0],
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop',
      isHeadline: false,
    };
    setArticles([newArticle, ...articles]);
    alert('기사가 발행되었습니다.');
  };

  return (
    <div>
      {/* 탭 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('curation')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'curation'
              ? 'bg-navy text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          메인 큐레이션
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'editor'
              ? 'bg-navy text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          기사 작성
        </button>
      </div>

      {activeTab === 'curation' && (
        <MainCuration
          articles={articles}
          mainSlots={mainSlots}
          setMainSlots={setMainSlots}
        />
      )}
      {activeTab === 'editor' && <ArticleEditor onPublish={handlePublish} />}
    </div>
  );
}

// 메인 관리자 페이지
export default function AdminPage() {
  const [currentMenu, setCurrentMenu] = useState('newsdesk');
  const [articles, setArticles] = useState(initialArticles);
  const [mainSlots, setMainSlots] = useState({
    headline: initialArticles.find((a) => a.isHeadline) || null,
    sub: initialArticles.filter((a) => !a.isHeadline).slice(0, 3),
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentMenu={currentMenu} setCurrentMenu={setCurrentMenu} />

      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {currentMenu === 'newsdesk' ? '뉴스 데스크' : '광고 관리자'}
          </h1>
        </div>

        {currentMenu === 'newsdesk' && (
          <NewsDesk
            articles={articles}
            setArticles={setArticles}
            mainSlots={mainSlots}
            setMainSlots={setMainSlots}
          />
        )}
        {currentMenu === 'ads' && <AdManager />}
      </main>
    </div>
  );
}
