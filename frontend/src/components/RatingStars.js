import React from 'react';

function RatingStars({ rating, onChange, readonly = false }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange && onChange(star)}
          disabled={readonly}
          className={`text-2xl ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <span className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
      {readonly && <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>}
    </div>
  );
}

export default RatingStars;
