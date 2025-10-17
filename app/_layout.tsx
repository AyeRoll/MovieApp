import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import './globals.css';

export default function RootLayout() {
  return (
  <>
  <StatusBar style="light" hidden={true} />
  <Stack
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="(tabs)"
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="movies/[id]"
      options={{
        headerShown: false,
        presentation: 'modal'
      }}
      />
  </Stack>
  </>
  );
}
