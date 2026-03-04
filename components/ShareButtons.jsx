'use client';

import { useState } from 'react';

export default function ShareButtons({ title, summary, url }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: summary || title,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      window.alert('공유 기능을 지원하지 않아 링크를 복사했습니다.');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      if (error?.name !== 'AbortError') {
        window.alert('공유에 실패했습니다. 다시 시도해 주세요.');
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.alert('링크 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  return (
    <div className="flex items-center gap-4 py-6 border-t border-b border-gray-200">
      <span className="text-gray-600 font-medium">공유하기</span>
      <button
        type="button"
        onClick={handleShare}
        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        aria-label="공유하기"
      >
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        aria-label="링크 복사"
      >
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
        </svg>
      </button>
      {copied && <span className="text-xs text-green-600">복사됨</span>}
    </div>
  );
}
