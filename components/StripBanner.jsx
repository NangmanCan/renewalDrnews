'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const TRANSITION_MS = 500;

const StripBanner = ({ banners = [], rolling = true, interval = 5 }) => {
  const [index, setIndex] = useState(0);
  const [transition, setTransition] = useState(true);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef(null);
  const trackedImpressionsRef = useRef(new Set());

  const multi = rolling && banners.length > 1;
  // 무한 루프용: 끝에 첫 슬라이드 복제
  const slides = multi ? [...banners, banners[0]] : banners.slice(0, 1);
  const realIndex = multi ? index % banners.length : 0;
  const current = banners[realIndex];

  const trackBanner = (bannerId, type) => {
    if (!bannerId) return;
    fetch(`/api/banners/${bannerId}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    }).catch(() => {});
  };

  // 컨테이너 가시성 추적
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.5 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  // 자동 전진 (화면에 보일 때만)
  useEffect(() => {
    if (!multi || !visible) return;
    const ms = Math.max(1, interval) * 1000;
    const id = setInterval(() => setIndex((i) => i + 1), ms);
    return () => clearInterval(id);
  }, [multi, visible, interval]);

  // 클론(마지막 복제 슬라이드) 도달 시 트랜지션 없이 0으로 리셋
  const handleTransitionEnd = () => {
    if (multi && index >= banners.length) {
      setTransition(false);
      setIndex(0);
    }
  };

  // 트랜지션 off로 점프한 다음 프레임에 다시 on (역방향 슬라이드 방지)
  useEffect(() => {
    if (transition) return;
    const raf = requestAnimationFrame(() => setTransition(true));
    return () => cancelAnimationFrame(raf);
  }, [transition]);

  // 배너 구성 변동 시 인덱스 초기화
  useEffect(() => {
    setIndex(0);
    setTransition(true);
  }, [banners.length, multi]);

  // 현재 노출 배너 impression (화면에 보일 때, 배너당 1회)
  useEffect(() => {
    if (!visible || !current?.id) return;
    if (trackedImpressionsRef.current.has(current.id)) return;
    trackedImpressionsRef.current.add(current.id);
    trackBanner(current.id, 'impression');
  }, [visible, current?.id]);

  if (banners.length === 0) return null;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="max-w-7xl mx-auto relative overflow-hidden">
        <div
          className="flex"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: transition ? `transform ${TRANSITION_MS}ms ease-in-out` : 'none',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((b, i) => (
            <a
              key={`${b.id}-${i}`}
              href={b.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackBanner(b.id, 'click')}
              className="relative block w-full flex-shrink-0"
              style={{ aspectRatio: '2400 / 180' }}
            >
              {b.image && (
                <Image
                  src={b.image}
                  alt={b.title || '광고'}
                  fill
                  priority={i === 0}
                  quality={95}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-cover"
                  unoptimized={b.image?.endsWith('.gif')}
                />
              )}
            </a>
          ))}
        </div>

        {/* 인디케이터 (롤링 ON + 배너 2개 이상) */}
        {multi && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setTransition(true); setIndex(idx); }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === realIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`배너 ${idx + 1}로 이동`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StripBanner;
