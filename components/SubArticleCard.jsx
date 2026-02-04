import Link from 'next/link';
import Image from 'next/image';

const SubArticleCard = ({ article }) => {
  return (
    <Link
      href={`/article/${article.id}`}
      className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
    >
      <div className="relative w-20 h-14 flex-shrink-0 rounded-md overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="80px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-navy text-white text-[10px] rounded font-medium leading-none">
          {article.category}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-navy line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {article.author} · {article.date}
        </p>
      </div>
    </Link>
  );
};

export default SubArticleCard;
