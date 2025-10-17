import React, { useState } from 'react';
import {
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface ReviewModalProps {
  visible: boolean;
  movie: Movie | MovieDetails;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  movie,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    // Allow submission with or without rating
    onSubmit(rating, review);
    setRating(0);
    setReview('');
    onClose();
  };

  const handleWatchedOnly = () => {
    // Mark as watched without rating or review
    onSubmit(0, '');
    setRating(0);
    setReview('');
    onClose();
  };

  const renderStars = () => {
    return (
      <View className="flex-row justify-center mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            className="mx-1"
          >
            <Text className={`text-4xl ${star <= rating ? 'text-yellow-400' : 'text-gray-400'}`}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-secondary rounded-2xl p-6 mx-4 w-4/5">
          <Text className="text-white text-xl font-bold text-center mb-4">
            Rate & Review
          </Text>
          
          <Text className="text-white text-lg text-center mb-6">
            {movie.title}
          </Text>

          {/* Star Rating */}
          {renderStars()}
          
          <Text className="text-white text-center mb-2">
            {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Tap to rate'}
          </Text>

          {/* Review Text Input */}
          <TextInput
            className="bg-white/10 rounded-lg p-3 text-white mb-6 min-h-[100px]"
            placeholder="Write your review (optional)..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={review}
            onChangeText={setReview}
            multiline
            textAlignVertical="top"
          />

          {/* Buttons */}
          <View className="flex-col gap-2">
            {/* Primary Action - Submit with Rating/Review */}
            <TouchableOpacity
              className="bg-accent rounded-lg py-3"
              onPress={handleSubmit}
            >
              <Text className="text-white text-center font-semibold">
                {rating > 0 || review ? 'Submit Review' : 'Mark as Watched'}
              </Text>
            </TouchableOpacity>
            
            {/* Secondary Action - Just Mark as Watched */}
            {(rating > 0 || review) && (
              <TouchableOpacity
                className="bg-white/20 rounded-lg py-2"
                onPress={handleWatchedOnly}
              >
                <Text className="text-white text-center text-sm">
                  Just mark as watched (no review)
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Cancel */}
            <TouchableOpacity
              className="bg-gray-600 rounded-lg py-2"
              onPress={onClose}
            >
              <Text className="text-white text-center text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReviewModal;