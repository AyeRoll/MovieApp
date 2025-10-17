import { icons } from '@/constants/icons';
import { fetchMovieDetails } from '@/services/api';
import useFetch from '@/services/useFetch';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ReviewModal from '../../components/ReviewModal';
import { isMovieSaved, isMovieWatched, markMovieAsWatched, removeSavedMovie, removeWatchedMovie, saveMovieToFirestore } from '../../services/firebase';
import { useGoogleLogin } from '../../useGoogleLogin';

interface MovieInfoProps {
    label: string;
    value: string | number | null | undefined;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">
      {label}
    </Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || 'N/A'}
    </Text>
  </View>

)

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const { userId } = useGoogleLogin();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  const { data: movie, loading } = useFetch(() => fetchMovieDetails(id as string));

  // Check if movie is already saved or watched
  useEffect(() => {
    const checkMovieStatus = async () => {
      if (!userId || !movie) return;
      
      try {
        const [savedStatus, watchedStatus] = await Promise.all([
          isMovieSaved(userId, movie.id),
          isMovieWatched(userId, movie.id)
        ]);
        setIsSaved(savedStatus);
        setIsWatched(watchedStatus);
      } catch (error) {
        console.error('Error checking movie status:', error);
      }
    };
    
    checkMovieStatus();
  }, [userId, movie]);

  const handleSaveMovie = async () => {
    if (!userId) {
      Alert.alert('Login Required', 'Please login to save movies');
      return;
    }
    
    if (!movie) return;
    
    setIsSaving(true);
    try {
      if (isSaved) {
        // Remove from saved
        await removeSavedMovie(userId, movie.id);
        setIsSaved(false);
        Alert.alert('Success', 'Movie removed from saved!');
      } else {
        // Add to saved
        await saveMovieToFirestore(userId, movie);
        setIsSaved(true);
        Alert.alert('Success', 'Movie saved!');
      }
    } catch (error) {
      Alert.alert('Error', isSaved ? 'Failed to remove movie' : 'Failed to save movie');
    } finally {
      setIsSaving(false);
    }
  };

  const handleWatchMovie = () => {
    if (!userId) {
      Alert.alert('Login Required', 'Please login to mark movies as watched');
      return;
    }
    
    if (isWatched) {
      // Remove from watched
      handleRemoveWatched();
    } else {
      // Add to watched
      setShowReviewModal(true);
    }
  };

  const handleRemoveWatched = async () => {
    if (!movie) return;
    
    setIsWatching(true);
    try {
      await removeWatchedMovie(userId!, movie.id);
      setIsWatched(false);
      Alert.alert('Success', 'Movie removed from watched!');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove movie from watched');
    } finally {
      setIsWatching(false);
    }
  };

  const handleReviewSubmit = async (rating: number, review: string) => {
    if (!movie) return;
    
    setIsWatching(true);
    try {
      await markMovieAsWatched(userId!, movie, rating, review);
      setIsWatched(true);
      // If movie was saved, it will be auto-removed by markMovieAsWatched
      setIsSaved(false);
      Alert.alert('Success', 'Movie marked as watched!');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark movie as watched');
    } finally {
      setIsWatching(false);
    }
  };

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ 
        paddingBottom: 80}}>
          <View>
            <Image 
            source={{ uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`}} 
            className="w-full h-[550px]" 
            resizeMode="stretch"
            />
          </View>

          <View className="flex-col items-start justify-center mt-5 px-5">
            <Text className="text-white font-bold text-xl">{movie?.title}</Text>
            <View className="flex-row items-center gap-x-1 mt-2">
              <Text className="text-light-200 text-sm">{movie?.release_date?.split('-')[0]}</Text>
              <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
            </View>
            <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
              <Image source={icons.star} className="size-4"/>
              <Text className="text-white font-bold text-sm">
                {((movie?.vote_average ?? 0) / 2).toFixed(1)}/5
              </Text>
              <Text className="text-light-200 text-sm">
                {movie?.vote_count} votes
              </Text>
            </View>

            {/* Action Buttons - Next to Movie Info */}
            <View className="flex-row gap-3 mt-4">
              {/* Save Button */}
              <TouchableOpacity
                className={`flex-1 rounded-lg py-3 flex-row items-center justify-center ${
                  isSaved ? 'bg-green-600' : 'bg-white/20'
                }`}
                onPress={handleSaveMovie}
                disabled={isSaving}
              >
                <Text className="text-white text-xl mr-2">
                  {isSaving ? '⏳' : isSaved ? '✅' : '🔖'}
                </Text>
                <Text className="text-white font-semibold text-sm">
                  {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>

              {/* Watch & Review Button */}
              <TouchableOpacity
                className={`flex-1 rounded-lg py-3 flex-row items-center justify-center ${
                  isWatched ? 'bg-blue-600' : 'bg-accent'
                }`}
                onPress={handleWatchMovie}
                disabled={isWatching}
              >
                <Text className="text-white text-xl mr-2">
                  {isWatching ? '⏳' : isWatched ? '👁️' : '🍿'}
                </Text>
                <Text className="text-white font-semibold text-sm">
                  {isWatching ? 'Processing...' : isWatched ? 'Watched' : 'Watch & Review'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="px-5">
            <MovieInfo 
              label="Overview"
              value={movie?.overview}
            />
            <MovieInfo 
              label="Genres"
              value={movie?.genres?.map((g) => g.name).join(' - ') || 'N/A'} 
            />
            <View className="flex flex-row justify-between w-1/2">
              <MovieInfo
                label="Budget"
                value={movie?.budget !== undefined
                    ? `$${Math.round(movie.budget / 1_000_000)} million`
                    : 'N/A'}
              />
              <MovieInfo
                label="Revenue"
                value={movie?.revenue !== undefined
                    ? `$${Math.round(movie.revenue / 1_000_000)} million`
                    : 'N/A'} 
              />
            </View>

            <MovieInfo
              label="Production Companies"
              value={movie?.production_companies.map((c) => c.name).join(' - ') || 'N/A'} 
            />
          </View>
      </ScrollView>

      {/* Back Button - Bottom Hovering */}
      <TouchableOpacity 
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50 shadow-lg"
        onPress={router.back}
        activeOpacity={0.8}
      >
        <Image 
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Back</Text>
      </TouchableOpacity>

      {/* Review Modal */}
      {movie && (
        <ReviewModal
          visible={showReviewModal}
          movie={movie}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </View>
  );
};

export default MovieDetails