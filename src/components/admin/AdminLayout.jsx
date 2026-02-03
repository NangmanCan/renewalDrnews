import { useState } from 'react';
import NewsDesk from './NewsDesk';
import AdManager from './AdManager';

const AdminLayout = ({ onExit, articles, setArticles, mainSlots, setMainSlots }) => {
  const [activeMenu, setActiveMenu] = useState('newsdesk');

  const menuItems = [
    { id: 'newsdesk', label: '뉴스 데스크', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
    { id: 'admanager', label: '광고 관리자', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">Dr.News</h1>
          <p className="text-sm text-gray-400 mt-1">관리자 페이지</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeMenu === item.id
                      ? 'bg-sky-600 text-white'
                      : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Exit Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onExit}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            사이트로 돌아가기
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {activeMenu === 'newsdesk' && (
          <NewsDesk
            articles={articles}
            setArticles={setArticles}
            mainSlots={mainSlots}
            setMainSlots={setMainSlots}
          />
        )}
        {activeMenu === 'admanager' && <AdManager />}
      </main>
    </div>
  );
};

export default AdminLayout;
