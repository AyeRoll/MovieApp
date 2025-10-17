// Firebase initialization and helpers
import { getApps, initializeApp } from 'firebase/app';
//import { getAuth, GoogleAuthProvider, onAuthStateChanged, signOut, initializeAuth, getReactNativePersistence, type User } from 'firebase/auth';
import { getAuth, GoogleAuthProvider, signOut } from 'firebase/auth';
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    increment,
    limit,
    orderBy,
    query,
    setDoc,
    updateDoc,
} from 'firebase/firestore';
// import { FirebaseClient } from '../../firebase/types';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// // Basic sanity check to help diagnose invalid API key issues
// if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
//     console.warn('Firebase config is incomplete. Check your EXPO_PUBLIC_FIREBASE_* env variables.');
// }

// Initialize app (avoid duplicate init in Fast Refresh)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

//export const auth = getAuth(app);

// const auth: FirebaseClient['auth'] = () => {
//     return fbAuth as unknown as ReturnType<FirebaseClient['auth']>;
// };

// // Prefer native persistence on device to keep sessions across app restarts
// export const auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(ReactNativeAsyncStorage)
// });

export const auth = getAuth(app);

export const db = getFirestore(app);

// Movie-related Firebase functions
export const saveMovieToFirestore = async (userId: string, movie: Movie | MovieDetails) => {
    try {
        const savedMovieData: SavedMovie = {
            id: `${userId}_${movie.id}`,
            userId,
            movieId: movie.id,
            movieData: movie as any, // Type assertion for now
            savedAt: new Date(),
        };
        
        await setDoc(doc(db, 'savedMovies', savedMovieData.id), savedMovieData);
        
        // Update user stats
        const userStatsRef = doc(db, 'userStats', userId);
        await updateDoc(userStatsRef, {
            savedCount: increment(1)
        }).catch(async () => {
            // If document doesn't exist, create it
            await setDoc(userStatsRef, {
                savedCount: 1,
                watchedCount: 0,
                reviewedCount: 0
            });
        });
        
        return savedMovieData;
    } catch (error) {
        console.error('Error saving movie:', error);
        throw error;
    }
};

export const markMovieAsWatched = async (userId: string, movie: Movie | MovieDetails, rating?: number, review?: string) => {
    try {
        const watchedMovieData: WatchedMovie = {
            id: `${userId}_${movie.id}`,
            userId,
            movieId: movie.id,
            movieData: movie as any, // Type assertion for now
            watchedAt: new Date(),
            hasReview: (rating !== undefined && rating > 0) || !!review,
            ...(rating !== undefined && rating > 0 && { rating }),
            ...(review !== undefined && { review }),
        };
        
        await setDoc(doc(db, 'watchedMovies', watchedMovieData.id), watchedMovieData);
        
        // Auto-remove from saved movies if it was saved
        try {
            const isSaved = await isMovieSaved(userId, movie.id);
            if (isSaved) {
                await removeSavedMovie(userId, movie.id);
            }
        } catch (error) {
            console.log('Note: Could not remove from saved movies, but movie was still marked as watched');
        }
        
        // Update user stats
        const userStatsRef = doc(db, 'userStats', userId);
        const statsUpdate: any = {
            watchedCount: increment(1)
        };
        
        // Count as reviewed if rating is provided OR review is provided
        if ((rating !== undefined && rating > 0) || review) {
            statsUpdate.reviewedCount = increment(1);
        }
        
        await updateDoc(userStatsRef, statsUpdate).catch(async () => {
            // If document doesn't exist, create it
            const hasReview = (rating !== undefined && rating > 0) || !!review;
            await setDoc(userStatsRef, {
                savedCount: 0,
                watchedCount: 1,
                reviewedCount: hasReview ? 1 : 0
            });
        });
        
        return watchedMovieData;
    } catch (error) {
        console.error('Error marking movie as watched:', error);
        throw error;
    }
};

export const getUserSavedMovies = async (userId: string): Promise<SavedMovie[]> => {
    try {
        const q = query(
            collection(db, 'savedMovies'),
            orderBy('savedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs
            .map(doc => doc.data() as SavedMovie)
            .filter(movie => movie.userId === userId);
    } catch (error) {
        console.error('Error fetching saved movies:', error);
        return [];
    }
};

export const getUserWatchedMovies = async (userId: string, reviewedOnly: boolean = false): Promise<WatchedMovie[]> => {
    try {
        const q = query(
            collection(db, 'watchedMovies'),
            orderBy('watchedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        let movies = querySnapshot.docs
            .map(doc => doc.data() as WatchedMovie)
            .filter(movie => movie.userId === userId);
            
        if (reviewedOnly) {
            movies = movies.filter(movie => movie.hasReview);
        }
        
        return movies;
    } catch (error) {
        console.error('Error fetching watched movies:', error);
        return [];
    }
};

export const getUserStats = async (userId: string): Promise<UserStats> => {
    try {
        const userStatsRef = doc(db, 'userStats', userId);
        const docSnap = await getDoc(userStatsRef);
        
        if (docSnap.exists()) {
            return docSnap.data() as UserStats;
        } else {
            // Return default stats if no document exists
            return {
                savedCount: 0,
                watchedCount: 0,
                reviewedCount: 0
            };
        }
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return {
            savedCount: 0,
            watchedCount: 0,
            reviewedCount: 0
        };
    }
};
export const googleProvider = new GoogleAuthProvider();

export async function firebaseSignOut() {
    await signOut(auth);
}

// export function observeAuth(callback: (user: User | null) => void) {
//     return onAuthStateChanged(auth, callback);
// }

// Domain helpers
type Movie = {
    id: number;
    title: string;
    poster_path?: string | null;
};

export type TrendingMovie = {
    searchTerm: string;
    movie_id: number;
    count: number;
    title: string;
    poster_url?: string;
};

// Track searches in Firestore under collection "searches"
export const updateSearchCount = async (queryText: string, movie: Movie) => {
    const coll = collection(db, 'searches');
    const id = `${queryText}__${movie.id}`;
    const ref = doc(coll, id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
        await updateDoc(ref, { count: increment(1) });
    } else {
        await setDoc(ref, {
            searchTerm: queryText,
            movie_id: movie.id,
            count: 1,
            title: movie.title,
            poster_url: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : undefined,
        });
    }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        const coll = collection(db, 'searches');
        const q = query(coll, orderBy('count', 'desc'), limit(5));
        const snap = await getDocs(q);
        return snap.docs.map((d) => d.data() as TrendingMovie);
    } catch (e) {
        console.log(e);
        return undefined;
    }
};

// Check if movie is already saved
export const isMovieSaved = async (userId: string, movieId: number): Promise<boolean> => {
    try {
        const docRef = doc(db, 'savedMovies', `${userId}_${movieId}`);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    } catch (error) {
        console.error('Error checking if movie is saved:', error);
        return false;
    }
};

// Check if movie is already watched
export const isMovieWatched = async (userId: string, movieId: number): Promise<boolean> => {
    try {
        const docRef = doc(db, 'watchedMovies', `${userId}_${movieId}`);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    } catch (error) {
        console.error('Error checking if movie is watched:', error);
        return false;
    }
};

// Remove movie from saved
export const removeSavedMovie = async (userId: string, movieId: number) => {
    try {
        await deleteDoc(doc(db, 'savedMovies', `${userId}_${movieId}`));
        
        // Update user stats
        const userStatsRef = doc(db, 'userStats', userId);
        await updateDoc(userStatsRef, {
            savedCount: increment(-1)
        }).catch(() => {
            // If document doesn't exist, ignore
            console.log('User stats document does not exist');
        });
    } catch (error) {
        console.error('Error removing saved movie:', error);
        throw error;
    }
};

// Remove movie from watched
export const removeWatchedMovie = async (userId: string, movieId: number) => {
    try {
        // Get the watched movie data first to check if it had a review
        const docRef = doc(db, 'watchedMovies', `${userId}_${movieId}`);
        const docSnap = await getDoc(docRef);
        const hadReview = docSnap.exists() && docSnap.data()?.hasReview;
        
        await deleteDoc(docRef);
        
        // Update user stats
        const userStatsRef = doc(db, 'userStats', userId);
        const statsUpdate: any = {
            watchedCount: increment(-1)
        };
        
        if (hadReview) {
            statsUpdate.reviewedCount = increment(-1);
        }
        
        await updateDoc(userStatsRef, statsUpdate).catch(() => {
            // If document doesn't exist, ignore
            console.log('User stats document does not exist');
        });
    } catch (error) {
        console.error('Error removing watched movie:', error);
        throw error;
    }
};;