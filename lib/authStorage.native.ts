// Keeps the Supabase session across app launches (Expo's recommended storage).
import 'expo-sqlite/localStorage/install';

export const authStorage = localStorage;
