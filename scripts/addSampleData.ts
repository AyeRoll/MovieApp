// Script to add sample data to Firebase for testing
import { markMovieAsWatched, saveMovieToFirestore } from '../services/firebase';

const sampleMovies: Movie[] = [
  {
    id: 238,
    title: "The Godfather",
    adult: false,
    backdrop_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
    genre_ids: [18, 80],
    original_language: "en",
    original_title: "The Godfather",
    overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family...",
    popularity: 111.239,
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    release_date: "1972-03-14",
    video: false,
    vote_average: 8.7,
    vote_count: 17853
  },
  {
    id: 424,
    title: "Schindler's List",
    adult: false,
    backdrop_path: "/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg",
    genre_ids: [18, 36, 10752],
    original_language: "en",
    original_title: "Schindler's List",
    overview: "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives...",
    popularity: 67.646,
    poster_path: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
    release_date: "1993-12-15",
    video: false,
    vote_average: 8.6,
    vote_count: 14303
  },
  {
    id: 680,
    title: "Pulp Fiction",
    adult: false,
    backdrop_path: "/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg",
    genre_ids: [18, 80],
    original_language: "en",
    original_title: "Pulp Fiction",
    overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll...",
    popularity: 96.802,
    poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    release_date: "1994-09-10",
    video: false,
    vote_average: 8.5,
    vote_count: 24947
  }
];

export const addSampleDataForUser = async (userId: string) => {
  console.log('Adding sample data for user:', userId);
  
  try {
    // Add some watched movies with reviews
    await markMovieAsWatched(userId, sampleMovies[0], 9, "Absolutely incredible masterpiece! The storytelling and character development are unmatched.");
    console.log('✅ Added The Godfather as watched with review');
    
    await markMovieAsWatched(userId, sampleMovies[1], 10, "A powerful and moving film that everyone should watch. Schindler's journey is unforgettable.");
    console.log('✅ Added Schindler\'s List as watched with review');
    
    // Add a watched movie without review
    await markMovieAsWatched(userId, sampleMovies[2]);
    console.log('✅ Added Pulp Fiction as watched without review');
    
    // Add some saved movies
    await saveMovieToFirestore(userId, sampleMovies[0]);
    await saveMovieToFirestore(userId, sampleMovies[1]);
    console.log('✅ Added saved movies');
    
    console.log('🎉 Sample data added successfully!');
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  }
};