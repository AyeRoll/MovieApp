import { images } from '@/constants/images';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileCard from '../../components/ProfileCard';
import { getUserStats } from '../../services/firebase';
import { useGoogleLogin } from '../../useGoogleLogin';

export default function Profile() {
  const { handleLogin, handleLogout, userId, userInfo, refreshUser } = useGoogleLogin();
  const [userStats, setUserStats] = useState<UserStats>({
    savedCount: 0,
    watchedCount: 0,
    reviewedCount: 0,
  });

  // Fetch real user stats from Firebase
  const fetchUserStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      const stats = await getUserStats(userId);
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }, [userId]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  // Refresh stats when the profile tab comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserStats();
    }, [fetchUserStats])
  );

  // Create user object with real auth data
  const user = userInfo ? {
    id: userId || "unknown",
    name: userInfo.name,
    email: userInfo.email,
    profilePicture: userInfo.profilePicture,
    createdAt: new Date(),
  } : null;

  return (
    <SafeAreaView className="bg-primary flex-1">
      {/* Background Image */}
      <Image source={images.bg} className="absolute w-full z-0"/>
      
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40, flexGrow: 1 }}
      >
        {/* Consistent spacing container */}
        <View className="px-4 mt-8">
          {userId && user ? (
            <ProfileCard user={user} stats={userStats} />
          ) : (
            <View className="mx-4 mb-8 min-h-[200px] rounded-2xl p-6 border-2 border-dashed border-white/30 bg-secondary justify-center">
              <Text className="text-white text-xl font-bold text-center">
                Sign in for Flix Card!
              </Text>
              <Text className="text-white/70 text-sm text-center mt-2">
                Login to see your movie license and stats
              </Text>
            </View>
          )}
        </View>
        
        {/* Fixed spacing for buttons */}
        <View className="px-10 mt-12">
          <View className="flex justify-center items-center flex-col gap-4 min-h-[200px]">
          
          {!userId && (
            <View className="w-full max-w-xs">
              <Button title="Login with Google" onPress={handleLogin} />
            </View>
          )}
          
          {userId && user && (
            <View className="w-full max-w-xs space-y-3">
              <Button 
                title="Watched Movies" 
                onPress={() => router.push('/watched?filter=all')} 
              />
              <View className="h-2" />
              <Button 
                title="Reviewed Movies" 
                onPress={() => router.push('/watched?filter=reviewed')} 
              />
            </View>
          )}
          
          {userId && (
            <View className="w-full max-w-xs mt-4">
              <Button title="Logout" color="#cc3333" onPress={handleLogout} />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

// Implement save movie function
// work with appwrite
// instead of searches track clicks
// create a function that fetches saved movies