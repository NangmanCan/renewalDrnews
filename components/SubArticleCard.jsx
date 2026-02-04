import Link from 'next/link';
import Image from 'next/image';

const SubArticleCard = ({ article }) => {
  return (
    <Link
      href={`/article/${article.id}`}
      className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
    >
      {/* 이미지 영역 */}
      <div className="relative h-36 overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-navy text-white text-[10px] rounded font-medium leading-none">
          {article.category}
        </span>
      </div>
      {/* 텍스트 영역 */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-navy line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {article.author} · {article.date}
        </p>
      </div>
    </Link>
  );
};

export default SubArticleCard;
