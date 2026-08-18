import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfielIcon, RoosterIcon, VideosIcon } from '@/components/TabIcons';
import { colors, fonts } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.rani,
        tabBarInactiveTintColor: '#A89BB5',
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.sand,
          borderTopWidth: 1,
          height: 58 + insets.bottom,
          paddingTop: 10,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bodySemiBold,
          fontSize: 11,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Rooster',
          tabBarIcon: ({ color }) => <RoosterIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: "Video's",
          tabBarIcon: ({ color }) => <VideosIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profiel"
        options={{
          title: 'Profiel',
          tabBarIcon: ({ color }) => <ProfielIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
