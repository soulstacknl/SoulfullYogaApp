import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BerichtenIcon, LessenIcon, ProfielIcon, RoosterIcon, VideosIcon } from '@/components/TabIcons';
import { colors, fonts } from '@/constants/theme';
import { useInbox } from '@/contexts/InboxContext';
import { useCurrentUser } from '@/contexts/UsersContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isAdmin = useCurrentUser()?.role === 'admin';
  const { badge } = useInbox();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.rani,
        tabBarInactiveTintColor: '#9DAFA2',
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
        name="lessen"
        options={{
          title: 'Mijn lessen',
          tabBarIcon: ({ color }) => <LessenIcon color={color} />,
          // The admin isn't a customer, so there's nothing to plan.
          href: isAdmin ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="berichten"
        options={{
          title: 'Berichten',
          tabBarIcon: ({ color }) => <BerichtenIcon color={color} />,
          tabBarBadge: badge || undefined,
          tabBarBadgeStyle: { backgroundColor: colors.rani, fontFamily: fonts.bodyBold, fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: "Video's",
          tabBarIcon: ({ color }) => <VideosIcon color={color} />,
          // Hidden until there are videos; Berichten takes its place.
          href: null,
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
