import React, { useState } from 'react';

const StarRating = ({ onChange }) => {
  const [rating, setRating] = useState(0);

  const handleStarClick = (value) => {
    setRating(value);
    onChange(value);
  };

  console.log(rating, 11)

  return (
<div>
  {[...Array(5)].map((_, index) => {
    const ratingValue = index + 1;
    const starStyle = {
      cursor: 'pointer',
      color: ratingValue <= rating ? ' #e67300' : '',
      fontSize: '24px'
    };
    return (
      <span
        key={ratingValue}
        style={starStyle}
        onClick={() => handleStarClick(ratingValue)}
      >
        {ratingValue <= rating ? '★' : '☆'}
      </span>
    );
  })}
</div>
  );
};

export default StarRating;
