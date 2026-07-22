import React from 'react';

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  return (
    <div className="star-rating">
      {[...Array(5)].map((_, i) => (
        <i 
          key={i} 
          className={`bi ${
            i < fullStars ? 'bi-star-fill' : 
            (i === fullStars && hasHalfStar ? 'bi-star-half' : 'bi-star')
          }`}
        ></i>
      ))}
      <span className="rating-value">{rating}</span>
    </div>
  );
};

export default StarRating;
