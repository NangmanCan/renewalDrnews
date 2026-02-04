const BannerAd = () => {
  return (
    <div className="flex flex-col gap-4 sticky top-24">
      {/* 배너 1: 무료 구인·구직 게시판 */}
      <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
        <div className="bg-[#eef6fb] p-5 text-center">
          <p className="text-[11px] text-gray-500 mb-1">의사회원을 위한</p>
          <p className="text-xl font-extrabold text-sky-600 leading-tight">무료</p>
          <p className="text-base font-extrabold text-[#0f172a] leading-tight">구인·구직 게시판</p>
          <button className="mt-4 px-5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-md transition-colors">
            바로가기
          </button>
        </div>
      </div>

      {/* 배너 2: 배너 광고 영역 문의 */}
      <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
        <div className="bg-[#fff8f0] p-5 text-center">
          <p className="text-sm font-bold text-[#0f172a] leading-tight">배너 광고</p>
          <p className="text-sm font-bold text-[#0f172a] leading-tight">영역</p>
          <p className="text-[11px] text-gray-500 mt-2">함께하기 좋은 위치</p>
          <p className="text-xl font-extrabold text-orange-600 mt-1">광고문의</p>
          <button className="mt-4 px-5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-md transition-colors">
            자세히 알아보기
          </button>
        </div>
      </div>

      {/* 배너 3: KMAMA 의료분쟁 */}
      <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
        <div className="bg-[#fefce8] p-4 text-center">
          <p className="text-[11px] font-bold text-gray-600">의료사고 분쟁 해결 어떻게 하지?</p>
          <p className="text-base font-extrabold text-[#0f172a] mt-1.5">KMAMA</p>
          <p className="text-[11px] text-gray-500 mt-0.5">대한의사협회의료피해보험제조합</p>
          <p className="text-[11px] text-gray-600 mt-2">가입문의 <span className="font-bold">1899-0059</span></p>
          <button className="mt-3 px-4 py-1 bg-[#0f172a] hover:bg-slate-800 text-white text-[11px] font-bold rounded transition-colors">
            온라인 청약가능
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerAd;
