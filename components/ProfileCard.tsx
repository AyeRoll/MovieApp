import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Image, Text, View } from 'react-native'
import { formatLicenseTitle, getLicenseLevel } from '../utils/userHelpers'

const ProfileCard: React.FC<ProfileCardProps> = ({ user, stats }) => {
    const licenseLevel = getLicenseLevel(stats.watchedCount, stats.reviewedCount);
    const licenseTitle = formatLicenseTitle(licenseLevel);
  
    return (
        <View className="mx-4 my-6" style={{
            shadowColor: '#AB8BFF',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.9,
            shadowRadius: 30,
            elevation: 25,
        }}>
            <LinearGradient 
                colors={['#4316b7ff', '#000000ff']} // Your preferred colors
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-3xl p-6 border-2 border-purple-300/40"
                style={{ 
                    minHeight: 240,
                    width: '100%',
                    shadowColor: '#AB8BFF',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 20,
                    elevation: 15,
                }}
            >
            {/* Header - License Title */}
            <View className="mb-5 items-center">
                <Text className="text-white text-2xl font-black text-center tracking-wider">
                    FLIX CARD
                </Text>
                <View className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mt-2 w-4/5" 
                      style={{ backgroundColor: 'rgba(255,255,255,0.5)' }} />
                <Text className="text-white/70 text-xs text-center mt-1 tracking-widest">
                    OFFICIAL MOVIE LICENSE
                </Text>
            </View>

            {/* Main Content Row */}
            <View className="flex-row items-stretch justify-between" style={{ minHeight: 120 }}>
                {/* Left Side - Profile Info */}
                <View className="flex-row items-center flex-1 mr-3">
                    {/* Profile Picture */}
                    <View className="w-20 h-20 rounded-full bg-white/25 ml-2 mr-4 items-center justify-center border-2 border-white/40"
                          style={{
                              width: 80,
                              height: 80,
                              shadowColor: '#FFFFFF',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.3,
                              shadowRadius: 8,
                              elevation: 5,
                          }}>
                        {user.profilePicture ? (
                            <Image 
                                source={{ uri: user.profilePicture }} 
                                style={{ 
                                    width: 76, 
                                    height: 76, 
                                    borderRadius: 38 
                                }}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text className="text-white text-3xl font-black">
                                {user.name.charAt(0).toUpperCase()}
                            </Text>
                        )}
                    </View>
                    
                    {/* User Name */}
                    <View className="flex-1" style={{ minWidth: 100 }}>
                        <Text className="text-white text-md font-black mb-1 tracking-wide" numberOfLines={2}>
                            {user.name.toUpperCase()}
                        </Text>
                        <Text className="text-white/80 text-sm tracking-wide" numberOfLines={2}>
                            {licenseTitle}
                        </Text>
                        <Text className="text-white/60 text-xs mt-1">
                            ID: {user.id.slice(-6)}
                        </Text>
                    </View>
                </View>

                {/* Right Side - Stats Column */}
                <View className="justify-center" style={{ minWidth: 110 }}>
                    <View className="bg-white/20 rounded-2xl p-4 border-2 mr-2 border-white/30"
                          style={{
                              shadowColor: '#FFFFFF',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.2,
                              shadowRadius: 6,
                              elevation: 3,
                              minWidth: 110,
                          }}>
                        <Text className="text-white text-sm font-black text-center mb-3 tracking-widest">
                            STATS
                        </Text>
                        <View className="space-y-2">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white/90 text-sm font-semibold">Saved</Text>
                                <Text className="text-white text-lg font-black">{stats.savedCount}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white/90 text-sm font-semibold">Watched</Text>
                                <Text className="text-white text-lg font-black">{stats.watchedCount}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white/90 text-sm font-semibold">Reviews</Text>
                                <Text className="text-white text-lg font-black">{stats.reviewedCount}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </LinearGradient>
    </View>
    )
}

export default ProfileCard
