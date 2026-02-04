import Link from 'next/link';
import Image from 'next/image';

const HeadlineNews = ({ article }) => {
  if (!article) return null;

  return (
    <Link
      href={`/article/${article.id}`}
      className="block group relative w-full h-[340px] md:h-[420px] rounded-2xl overflow-hidden shadow-2xl"
    >
      <Image
        src={article.image}
        alt={article.title}
        fill
        priority
        className="object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
        <span className="inline-block px-3 py-1 bg-sky-600 text-white text-sm font-semibold rounded mb-3">
          {article.category}
        </span>
        <h2 className="text-xl md:text-3xl font-bold text-white mb-2 leading-tight group-hover:text-sky-300 transition-colors">
          {article.title}
        </h2>
        <p className="text-gray-200 text-sm md:text-base mb-3 line-clamp-2 max-w-3xl">
          {article.summary}
        </p>
        <div className="flex items-center gap-3 text-gray-300 text-xs">
          <span>{article.author}</span>
          <span>|</span>
          <time>{article.date}</time>
        </div>
      </div>
    </Link>
  );
};

export default HeadlineNews;
