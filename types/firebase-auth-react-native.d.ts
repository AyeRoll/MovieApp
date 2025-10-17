declare module 'firebase/auth/react-native' {
  export * from 'firebase/auth';
  // Narrow types are available in Firebase's internal types, but 'any' here keeps the project simple.
  export const initializeAuth: any;
  export const getReactNativePersistence: any;
}
