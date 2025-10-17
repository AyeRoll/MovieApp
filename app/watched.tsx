import { icons } from '@/constants/icons';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserWatchedMovies } from '../services/firebase';
import { useGoogleLogin } from '../useGoogleLogin';

export default function WatchedMovies() {
  const { filter } = useLocalSearchParams(); // Get filter from navigation
  const { userId } = useGoogleLogin();
  const [activeFilter, setActiveFilter] = useState(filter || 'all');
  const [watchedMovies, setWatchedMovies] = useState<WatchedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch watched movies from Firebase
  const fetchWatchedMovies = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const movies = await getUserWatchedMovies(userId, false); // Get all watched movies
      setWatchedMovies(movies);
    } catch (error) {
      console.error('Error fetching watched movies:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchWatchedMovies();
  }, [fetchWatchedMovies]);

  // Refresh watched movies when the page comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchWatchedMovies();
    }, [fetchWatchedMovies])
  );

  // Filter movies based on active filter
  const filteredMovies = activeFilter === 'reviewed' 
    ? watchedMovies.filter(movie => movie.hasReview)
    : watchedMovies;

  return (
    <SafeAreaView className="bg-primary flex-1">
      <ScrollView className="py-10 px-4">
        {/* Header */}
        <Text className="text-white text-2xl font-bold mb-6">
          {activeFilter === 'reviewed' ? 'Reviewed Movies' : 'Watched Movies'}
        </Text>
        
        {/* Filter Buttons */}
        <View className="flex-row mb-6 bg-white/10 rounded-xl p-1">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${activeFilter === 'all' ? 'bg-accent' : 'bg-transparent'}`}
            onPress={() => setActiveFilter('all')}
          >
            <Text className={`text-center font-semibold ${activeFilter === 'all' ? 'text-white' : 'text-white/70'}`}>
              Watched
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${activeFilter === 'reviewed' ? 'bg-accent' : 'bg-transparent'}`}
            onPress={() => setActiveFilter('reviewed')}
          >
            <Text className={`text-center font-semibold ${activeFilter === 'reviewed' ? 'text-white' : 'text-white/70'}`}>
            Reviewed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Movies List */}
        {loading ? (
          <View className="flex-1 justify-center items-center mt-20">
            <ActivityIndicator size="large" color="#AB8BFF" />
            <Text className="text-white/70 mt-4">Loading movies...</Text>
          </View>
        ) : filteredMovies.length > 0 ? (
          filteredMovies.map((movie, index) => (
            <TouchableOpacity 
              key={movie.id} 
              className="bg-white/5 rounded-xl p-4 mb-4 flex-row"
              onPress={() => router.push(`/movies/${movie.movieData.id}`)}
              activeOpacity={0.7}
            >
              {/* Movie Poster */}
              <Image
                source={{ 
                  uri: `https://image.tmdb.org/t/p/w500${movie.movieData.poster_path}` 
                }}
                className="w-20 h-30 rounded-lg mr-4"
                resizeMode="cover"
              />
              
              {/* Movie Info */}
              <View className="flex-1">
                <Text className="text-white text-lg font-bold mb-1">
                  {movie.movieData.title}
                </Text>
                <Text className="text-white/70 text-sm mb-2">
                  {movie.movieData.release_date?.substring(0, 4)}
                </Text>
                <Text className="text-white/60 text-sm mb-2">
                  Watched: {new Date(movie.watchedAt).toLocaleDateString()}
                </Text>
                
                {movie.hasReview && (
                  <View className="mt-2 bg-white/10 rounded-lg p-3">
                    <View className="flex-row items-center mb-2">
                      <View className="flex-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Text 
                            key={star} 
                            className={`text-lg ${star <= (movie.rating || 0) ? 'text-yellow-400' : 'text-gray-500'}`}
                          >
                            ★
                          </Text>
                        ))}
                      </View>
                      <Text className="text-white/80 text-sm ml-2">
                        ({movie.rating}/5)
                      </Text>
                    </View>
                    {movie.review && (
                      <Text className="text-white/90 text-sm italic">
                        "{movie.review}"
                      </Text>
                    )}
                  </View>
                )}
                
                {!movie.hasReview && (
                  <View className="mt-2">
                    <Text className="text-white/50 text-sm">No review yet</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-white/70 text-center text-lg">
              {activeFilter === 'reviewed' 
                ? 'No reviewed movies yet' 
                : 'No watched movies yet'}
            </Text>
            <Text className="text-white/50 text-center text-sm mt-2">
              {activeFilter === 'reviewed' 
                ? 'Movies with reviews will appear here' 
                : 'Mark movies as watched to see them here'}
            </Text>
          </View>
        )}
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
    </SafeAreaView>

    
  );
}