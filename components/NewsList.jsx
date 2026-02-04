import NewsCard from './NewsCard';

const NewsList = ({ articles }) => {
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        뉴스가 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default NewsList;
