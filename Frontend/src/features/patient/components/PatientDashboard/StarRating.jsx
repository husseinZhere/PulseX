const StarRating = ({ rating, max = 5 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <span key={i} className={`${i < rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'} text-sm leading-none`}>
        ★
      </span>
    ))}
  </div>
);

export default StarRating;
