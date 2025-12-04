import React from 'react';
import RatingStars from './RatingStars';

function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        <p className="text-gray-600">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Reviews ({reviews.length})</h2>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-4 last:border-b-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold">{review.user.name}</p>
                <RatingStars rating={review.rating} readonly />
              </div>
              <p className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
            {review.review && (
              <p className="text-gray-700 mt-2">{review.review}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReviewList;
