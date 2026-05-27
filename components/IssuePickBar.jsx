import Link from 'next/link';

function formatKoreanDate(date = new Date()) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일(${days[date.getDay()]})`;
}

function PickItem({ label, title, href }) {
  return (
    <Link
      href={href || '#'}
      className="group flex-1 min-w-0 pl-5 border-l border-gray-200 first:border-l-0 first:pl-0"
    >
      <div className="text-[13px] font-bold text-brand-600 mb-1.5 tracking-wide">{label}</div>
      <div className="text-[17px] font-bold text-navy leading-snug line-clamp-1 group-hover:text-brand-600 transition-colors">
        {title}
      </div>
    </Link>
  );
}

function MobilePickItem({ label, href }) {
  return (
    <Link
      href={href || '#'}
      className="flex-1 min-w-0 px-2 py-2.5 text-center first:border-l-0 border-l border-gray-200"
    >
      <span className="block text-[12px] font-bold text-brand-600 truncate">
        {label}
      </span>
    </Link>
  );
}

export default function IssuePickBar({ picks = [] }) {
  if (!picks || picks.length === 0) return null;

  return (
    <>
      {/* PC: 가로 띠 — 하단 굵은 brand 라인을 max-w-7xl 안쪽에 그림 */}
      <div className="hidden lg:block bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-stretch gap-6 border-b-4 border-brand-600">
          {/* 로고 이미지 내부 좌측 흰 여백(~20px)만큼 padding-left로 좌측 정렬 보정 */}
          <div className="flex-shrink-0 w-40 pl-5 flex flex-col justify-center">
            <div className="text-[15px] font-extrabold text-brand-600 tracking-wider">DOCTOR&apos;S PICK</div>
            <div className="text-[13px] text-gray-500 mt-1">{formatKoreanDate()}</div>
          </div>
          <div className="flex-1 flex items-center gap-5">
            {picks.slice(0, 3).map((p, idx) => (
              <PickItem key={p.id || idx} label={p.label} title={p.title} href={p.href} />
            ))}
          </div>
        </div>
      </div>

      {/* 모바일: 가로 3분할 — 하단만 굵은 brand 라인 */}
      <div className="lg:hidden bg-white">
        <div className="flex items-stretch border-b-4 border-brand-600">
          {picks.slice(0, 3).map((p, idx) => (
            <MobilePickItem key={p.id || idx} label={p.label} href={p.href} />
          ))}
        </div>
      </div>
    </>
  );
}
