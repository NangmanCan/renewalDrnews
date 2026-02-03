'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { articles as initialArticles } from '@/data/articles';
import { initialBanners } from '@/data/banners';

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

// 기사 작성/수정 에디터
function ArticleEditor({ onPublish, onUpdate, editingArticle, onCancelEdit }) {
  const [form, setForm] = useState({
    title: '',
    category: '정책',
    author: '',
    summary: '',
    content: '',
  });

  const categories = ['정책', '학술', '병원', '산업'];

  // 수정 모드일 때 폼에 기사 내용 로드
  useState(() => {
    if (editingArticle) {
      setForm({
        title: editingArticle.title || '',
        category: editingArticle.category || '정책',
        author: editingArticle.author || '',
        summary: editingArticle.summary || '',
        content: editingArticle.content || '',
      });
    }
  }, [editingArticle]);

  // editingArticle이 변경될 때 폼 업데이트
  if (editingArticle && form.title !== editingArticle.title && form.title === '') {
    setForm({
      title: editingArticle.title || '',
      category: editingArticle.category || '정책',
      author: editingArticle.author || '',
      summary: editingArticle.summary || '',
      content: editingArticle.content || '',
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert('제목과 본문을 입력해주세요.');
      return;
    }

    if (editingArticle) {
      onUpdate({ ...editingArticle, ...form });
    } else {
      onPublish(form);
    }
    setForm({ title: '', category: '정책', author: '', summary: '', content: '' });
  };

  const handleCancel = () => {
    setForm({ title: '', category: '정책', author: '', summary: '', content: '' });
    onCancelEdit();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {editingArticle ? '기사 수정' : '기사 작성'}
        </h2>
        {editingArticle && (
          <button
            onClick={handleCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            취소하고 새 기사 작성
          </button>
        )}
      </div>
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
          className={`w-full py-3 text-white font-medium rounded-lg transition-colors ${
            editingArticle
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-sky-600 hover:bg-sky-700'
          }`}
        >
          {editingArticle ? '수정 완료' : '발행하기'}
        </button>
      </form>
    </div>
  );
}

// 기사 관리 (리스트 + 수정/삭제)
function ArticleManager({ articles, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">기사 관리</h2>
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {articles.map((article) => (
          <div
            key={article.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-400">{article.date}</span>
                </div>
                <p className="font-medium text-gray-900 mb-1">{article.title}</p>
                <p className="text-sm text-gray-500 line-clamp-1">{article.summary}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(article)}
                  className="px-3 py-1.5 text-sm bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete(article.id)}
                  className="px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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

// 광고 관리자
function AdManager({ banners, setBanners }) {
  const [selectedType, setSelectedType] = useState('headline');
  const [previewMode, setPreviewMode] = useState('mobile'); // 'pc' or 'mobile'

  const typeLabels = {
    headline: '헤드라인 슬라이드 광고',
    bottom: '하단 롤링 배너',
    sidebar: '사이드 배너',
  };

  const filteredBanners = banners
    .filter((b) => b.type === selectedType)
    .sort((a, b) => a.order - b.order);

  const toggleActive = (id) => {
    setBanners(banners.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
  };

  const moveUp = (id) => {
    const banner = banners.find((b) => b.id === id);
    const sametype = banners.filter((b) => b.type === banner.type).sort((a, b) => a.order - b.order);
    const idx = sametype.findIndex((b) => b.id === id);
    if (idx <= 0) return;
    const prev = sametype[idx - 1];
    setBanners(
      banners.map((b) => {
        if (b.id === id) return { ...b, order: prev.order };
        if (b.id === prev.id) return { ...b, order: banner.order };
        return b;
      })
    );
  };

  const moveDown = (id) => {
    const banner = banners.find((b) => b.id === id);
    const sametype = banners.filter((b) => b.type === banner.type).sort((a, b) => a.order - b.order);
    const idx = sametype.findIndex((b) => b.id === id);
    if (idx >= sametype.length - 1) return;
    const next = sametype[idx + 1];
    setBanners(
      banners.map((b) => {
        if (b.id === id) return { ...b, order: next.order };
        if (b.id === next.id) return { ...b, order: banner.order };
        return b;
      })
    );
  };

  const activeBanners = banners.filter((b) => b.isActive);
  const sidebarBanners = activeBanners.filter((b) => b.type === 'sidebar');
  const bottomBanners = activeBanners.filter((b) => b.type === 'bottom');
  const headlineBanners = activeBanners.filter((b) => b.type === 'headline');

  // PC 미리보기
  const PCPreview = () => (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-full mx-auto">
        {/* 헤더 */}
        <div className="bg-navy text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">Dr.News</span>
            <div className="flex gap-3 text-xs text-gray-300">
              <span>정책</span>
              <span>학술</span>
              <span>병원</span>
              <span>산업</span>
              <span>AI</span>
              <span>제약·바이오</span>
            </div>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex p-4 gap-4">
          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            {/* 헤드라인 */}
            <div className="relative h-32 bg-gray-200 rounded-lg overflow-hidden mb-4">
              {headlineBanners.length > 0 ? (
                <div className="relative w-full h-full">
                  <Image src={headlineBanners[0]?.image} alt="headline" fill className="object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-2">
                    <p className="text-white text-xs font-medium truncate">{headlineBanners[0]?.title}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">헤드라인 광고</div>
              )}
            </div>

            <h3 className="text-sm font-bold text-gray-800 mb-3">최신 뉴스</h3>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-2">
                  <div className="bg-gray-200 h-12 rounded mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>

          {/* 사이드바 광고 영역 (가로형) */}
          <div className="w-36 flex-shrink-0">
            <h4 className="text-[10px] font-semibold text-gray-500 mb-2">광고</h4>
            {sidebarBanners.length > 0 ? (
              sidebarBanners.map((banner) => (
                <div key={banner.id} className="mb-3 rounded-lg overflow-hidden shadow-md bg-white">
                  <div className="relative h-12">
                    <Image src={banner.image} alt={banner.title} fill className="object-cover" />
                    <span className="absolute top-1 left-1 bg-black/60 text-white text-[6px] px-1 rounded">AD</span>
                  </div>
                  <div className="p-1.5">
                    <p className="text-[8px] font-medium text-gray-800 line-clamp-1">{banner.title}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-400 text-[10px]">사이드 광고 없음</div>
            )}
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-gray-500 mt-3">PC 버전 - 사이드바에 가로형 배너 표시</p>
    </div>
  );

  // 모바일 미리보기
  const MobilePreview = () => {
    const nativeAds = [...bottomBanners, ...sidebarBanners].slice(0, 2);

    return (
      <div className="flex justify-center">
        <div className="w-[280px] bg-gray-900 rounded-[36px] p-2.5 shadow-xl">
          {/* 노치 */}
          <div className="bg-gray-900 h-5 flex items-center justify-center mb-0.5">
            <div className="w-14 h-2.5 bg-gray-800 rounded-full"></div>
          </div>

          <div className="bg-gray-50 rounded-[28px] overflow-hidden h-[480px] overflow-y-auto">
            {/* 헤더 */}
            <div className="bg-navy text-white px-3 py-2">
              <p className="text-sm font-bold">Dr.News</p>
            </div>

            {/* 카테고리 */}
            <div className="bg-slate-800 px-2 py-1 flex gap-2 overflow-x-auto">
              {['정책', '학술', '병원', '산업', 'AI', '제약·바이오'].map((cat) => (
                <span key={cat} className="text-[7px] text-gray-300 whitespace-nowrap">{cat}</span>
              ))}
            </div>

            {/* 헤드라인 */}
            <div className="p-2">
              <div className="relative h-24 bg-gray-200 rounded-lg overflow-hidden">
                {headlineBanners.length > 0 ? (
                  <div className="relative w-full h-full">
                    <Image src={headlineBanners[0]?.image} alt="headline" fill className="object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-1.5">
                      <p className="text-white text-[9px] font-medium truncate">{headlineBanners[0]?.title}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-[9px]">헤드라인 광고</div>
                )}
              </div>
            </div>

            {/* 콘텐츠 - 기사와 네이티브 광고 */}
            <div className="px-2 space-y-2">
              <h3 className="text-[10px] font-bold text-gray-800">최신 뉴스</h3>

              {/* 기사 1 */}
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="flex gap-2">
                  <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-1.5 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-1.5 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>

              {/* 기사 2 */}
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="flex gap-2">
                  <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-1.5 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-1.5 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>

              {/* 네이티브 광고 1 */}
              {nativeAds[0] && (
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg overflow-hidden shadow-sm border border-sky-100">
                  <div className="flex gap-2 p-2">
                    <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                      <Image src={nativeAds[0].image} alt={nativeAds[0].title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[6px] text-sky-600 font-semibold">Sponsored</span>
                      <p className="text-[8px] font-medium text-gray-800 line-clamp-2">{nativeAds[0].title}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 기사 3 */}
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="flex gap-2">
                  <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-1.5 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-1.5 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>

              {/* 기사 4 */}
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="flex gap-2">
                  <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-1.5 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-1.5 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>

              {/* 네이티브 광고 2 */}
              {nativeAds[1] && (
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg overflow-hidden shadow-sm border border-sky-100">
                  <div className="flex gap-2 p-2">
                    <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                      <Image src={nativeAds[1].image} alt={nativeAds[1].title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[6px] text-sky-600 font-semibold">Sponsored</span>
                      <p className="text-[8px] font-medium text-gray-800 line-clamp-2">{nativeAds[1].title}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 하단 홈 인디케이터 */}
            <div className="h-3 flex items-center justify-center mt-2">
              <div className="w-16 h-0.5 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 좌측: 배너 설정 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">배너 관리</h2>

        {/* 타입 선택 탭 */}
        <div className="flex gap-2 mb-6">
          {Object.entries(typeLabels).map(([type, label]) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedType === type
                  ? 'bg-navy text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 배너 리스트 */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredBanners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`p-4 border rounded-lg transition-colors ${
                banner.isActive ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* 순서 이동 버튼 */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveUp(banner.id)}
                    disabled={idx === 0}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveDown(banner.id)}
                    disabled={idx === filteredBanners.length - 1}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* 썸네일 */}
                <div className="w-20 h-12 relative rounded overflow-hidden flex-shrink-0">
                  <Image src={banner.image} alt={banner.title} fill className="object-cover" />
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{banner.title}</p>
                  <p className="text-sm text-gray-500 truncate">{banner.description}</p>
                </div>

                {/* ON/OFF 토글 */}
                <button
                  onClick={() => toggleActive(banner.id)}
                  className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                    banner.isActive
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {banner.isActive ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          ))}
          {filteredBanners.length === 0 && (
            <p className="text-center text-gray-400 py-8">등록된 배너가 없습니다</p>
          )}
        </div>
      </div>

      {/* 우측: 미리보기 (PC/모바일 탭) */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">미리보기</h2>
          {/* PC/모바일 탭 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode('pc')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                previewMode === 'pc' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              PC
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                previewMode === 'mobile' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              모바일
            </button>
          </div>
        </div>

        {/* 미리보기 콘텐츠 */}
        {previewMode === 'pc' ? <PCPreview /> : <MobilePreview />}

        {/* 활성 배너 카운트 */}
        <div className="mt-4 text-center text-sm text-gray-500">
          활성 배너: 헤드라인 {headlineBanners.length}개, 하단 {bottomBanners.length}개, 사이드 {sidebarBanners.length}개
        </div>
        <p className="text-center text-xs text-gray-400 mt-1">
          {previewMode === 'pc' ? '사이드바에 가로형 배너로 표시됩니다' : '기사 사이에 네이티브 광고로 표시됩니다'}
        </p>
      </div>
    </div>
  );
}

// 뉴스 데스크
function NewsDesk({ articles, setArticles, mainSlots, setMainSlots }) {
  const [activeTab, setActiveTab] = useState('curation');
  const [editingArticle, setEditingArticle] = useState(null);

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

  const handleUpdate = (updatedArticle) => {
    setArticles(articles.map((a) => (a.id === updatedArticle.id ? updatedArticle : a)));
    // mainSlots도 업데이트
    if (mainSlots.headline?.id === updatedArticle.id) {
      setMainSlots({ ...mainSlots, headline: updatedArticle });
    }
    const subIndex = mainSlots.sub.findIndex((a) => a.id === updatedArticle.id);
    if (subIndex !== -1) {
      const newSub = [...mainSlots.sub];
      newSub[subIndex] = updatedArticle;
      setMainSlots({ ...mainSlots, sub: newSub });
    }
    setEditingArticle(null);
    alert('기사가 수정되었습니다.');
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setActiveTab('editor');
  };

  const handleDelete = (articleId) => {
    if (!confirm('정말 이 기사를 삭제하시겠습니까?')) return;
    setArticles(articles.filter((a) => a.id !== articleId));
    // mainSlots에서도 제거
    if (mainSlots.headline?.id === articleId) {
      setMainSlots({ ...mainSlots, headline: null });
    }
    setMainSlots({
      ...mainSlots,
      sub: mainSlots.sub.filter((a) => a.id !== articleId),
    });
    alert('기사가 삭제되었습니다.');
  };

  const handleCancelEdit = () => {
    setEditingArticle(null);
  };

  return (
    <div>
      {/* 탭 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => { setActiveTab('curation'); setEditingArticle(null); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'curation'
              ? 'bg-navy text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          메인 큐레이션
        </button>
        <button
          onClick={() => { setActiveTab('manage'); setEditingArticle(null); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'manage'
              ? 'bg-navy text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          기사 관리
        </button>
        <button
          onClick={() => { setActiveTab('editor'); setEditingArticle(null); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'editor'
              ? 'bg-navy text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {editingArticle ? '기사 수정' : '기사 작성'}
        </button>
      </div>

      {activeTab === 'curation' && (
        <MainCuration
          articles={articles}
          mainSlots={mainSlots}
          setMainSlots={setMainSlots}
        />
      )}
      {activeTab === 'manage' && (
        <ArticleManager
          articles={articles}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {activeTab === 'editor' && (
        <ArticleEditor
          onPublish={handlePublish}
          onUpdate={handleUpdate}
          editingArticle={editingArticle}
          onCancelEdit={handleCancelEdit}
        />
      )}
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
  const [banners, setBanners] = useState(initialBanners);

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
        {currentMenu === 'ads' && <AdManager banners={banners} setBanners={setBanners} />}
      </main>
    </div>
  );
}
