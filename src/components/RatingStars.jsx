import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './RatingStars.css';

function RatingStars({ materialId, userId, initialRating = 0, onRatingChange }) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRated, setIsRated] = useState(initialRating > 0);
  const [loading, setLoading] = useState(false);

  const handleRate = async (value) => {
    if (!userId || isRated) return;
    
    setLoading(true);
    try {
      // Check if user already rated this material
      const { data: existingRating } = await supabase
        .from('ratings')
        .select('*')
        .eq('material_id', materialId)
        .eq('user_id', userId)
        .single();

      if (existingRating) {
        // Update existing rating
        await supabase
          .from('ratings')
          .update({ rating: value })
          .eq('id', existingRating.id);
      } else {
        // Insert new rating
        await supabase
          .from('ratings')
          .insert([
            {
              material_id: materialId,
              user_id: userId,
              rating: value
            }
          ]);
      }

      setRating(value);
      setIsRated(true);
      if (onRatingChange) onRatingChange(value);
    } catch (error) {
      console.error('Error rating material:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rating-stars">
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`star-btn ${star <= (hoverRating || rating) ? 'filled' : ''}`}
            onClick={() => handleRate(star)}
            onMouseEnter={() => !isRated && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={loading || isRated || !userId}
            aria-label={`Rate ${star} stars`}
            type="button"
          >
            <svg 
              viewBox="0 0 24 24" 
              fill={star <= (hoverRating || rating) ? '#f3e88b' : 'none'}
              stroke={star <= (hoverRating || rating) ? '#d4a81d' : '#d1d5db'}
              strokeWidth="2"
              className="star-icon"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
      {isRated && <span className="rated-text">Rated!</span>}
      {!userId && <span className="login-prompt">Login to rate</span>}
    </div>
  );
}

// Helper function to calculate average rating
export async function getAverageRating(materialId) {
  const { data, error } = await supabase
    .from('ratings')
    .select('rating')
    .eq('material_id', materialId);

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0 };
  }

  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: (sum / data.length).toFixed(1),
    count: data.length
  };
}

export default RatingStars;