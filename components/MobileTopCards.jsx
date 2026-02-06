'use client';

import Image from 'next/image';
import Link from 'next/link';

const MobileTopCards = ({ articles = [] }) => {
  if (articles.length < 2) return null;

  return (
    <div className="grid grid-cols-2 gap-[2px] mb-[2px]">
      {articles.slice(0, 2).map((article) => {
        const isOpinion = article.category === '칼럼' || article.category === '기고' || article.authorTitle || article.author_title;
        const href = isOpinion ? `/opinion/${article.id}` : `/article/${article.id}`;

        return (
          <Link key={article.id} href={href} className="relative block h-[160px] overflow-hidden group">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="font-headline text-[15px] text-white leading-snug line-clamp-2 group-hover:underline">
                {article.title}
              </h3>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileTopCards;
