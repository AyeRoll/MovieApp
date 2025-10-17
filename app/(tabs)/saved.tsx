import MovieCard from '@/components/MovieCard';
import { images } from '@/constants/images';
import { fetchMovies } from '@/services/api';
import { getUserSavedMovies } from '@/services/firebase';
import useFetch from '@/services/useFetch';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, Text, View } from 'react-native';
import { useGoogleLogin } from '../../useGoogleLogin';

const saved = () => {
  const { userId } = useGoogleLogin();
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch random movies to make it interesting
  const {
    data: randomMovies, 
    loading: randomLoading, 
  } = useFetch(() => fetchMovies({ query: '' }));

  // Fetch saved movies from Firebase
  const fetchSavedMovies = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const movies = await getUserSavedMovies(userId);
      setSavedMovies(movies);
    } catch (error) {
      console.error('Error fetching saved movies:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchSavedMovies();
  }, [fetchSavedMovies]);

  // Refresh saved movies when the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSavedMovies();
    }, [fetchSavedMovies])
  );

  // Get 12 random movies from the fetched movies
  const getRandomMovies = (movies: Movie[], count: number = 12) => {
    if (!movies || movies.length === 0) return [];
    const shuffled = [...movies].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const randomSelection = randomMovies ? getRandomMovies(randomMovies, 12) : [];

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0"/>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-2xl font-bold mt-24 mb-5 text-center">Saved Movies</Text>

        {loading || randomLoading ? (
          <View className="flex-1 justify-center items-center mt-20">
            <ActivityIndicator size="large" color="#AB8BFF" />
            <Text className="text-white/70 mt-4">Loading movies...</Text>
          </View>
        ) : (
          <View className="flex-1">
            {/* Saved Movies Section */}
            {savedMovies.length > 0 ? (
              <>
                <Text className="text-lg text-white font-bold mb-3">Your Saved Movies</Text>
                <FlatList
                  data={savedMovies.map(saved => saved.movieData)}
                  renderItem={({ item }) => (
                    <MovieCard
                      {...item}
                    />
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={3}
                  columnWrapperStyle={{
                    justifyContent: 'flex-start',
                    gap: 20,
                    paddingRight: 5,
                    marginBottom: 10
                  }}
                  className="mb-8"
                  scrollEnabled={false}
                />
              </>
            ) : (
              <View className="bg-white/5 rounded-xl p-6 mb-8">
                <Text className="text-white/70 text-center text-base">
                  No saved movies yet
                </Text>
                <Text className="text-white/50 text-center text-sm mt-2">
                  Save movies to see them here
                </Text>
              </View>
            )}

            {/* Random Movies Section */}
            {randomSelection.length > 0 && (
              <>
                <Text className="text-lg text-white font-bold mb-3 mt-5">Discover More Movies</Text>
                <FlatList
                  data={randomSelection}
                  renderItem={({ item }) => (
                    <MovieCard
                      {...item}
                    />
                  )}
                  keyExtractor={(item) => `random_${item.id.toString()}`}
                  numColumns={3}
                  columnWrapperStyle={{
                    justifyContent: 'flex-start',
                    gap: 20,
                    paddingRight: 5,
                    marginBottom: 10
                  }}
                  className="pb-20"
                  scrollEnabled={false}
                />
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default saved