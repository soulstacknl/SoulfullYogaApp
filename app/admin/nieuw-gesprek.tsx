import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ChatRow } from '@/components/BerichtenParts';
import ScreenHeader from '@/components/ScreenHeader';
import TextField from '@/components/TextField';
import { colors } from '@/constants/theme';
import { useUsers } from '@/contexts/UsersContext';

// The admin picks a customer to start (or continue) a conversation with.
export default function NieuwGesprekScreen() {
  const { students } = useUsers();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const list = students
    .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.includes(q))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 40);

  return (
    <View style={styles.container}>
      <ScreenHeader backLabel="Berichten" onBack={() => router.back()} eyebrow="Docentmodus" title="Nieuw gesprek" subtitle="Kies een klant" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField label="Zoeken" placeholder="Naam of e-mailadres" value={query} onChangeText={setQuery} />
        {list.map((u) => (
          <ChatRow key={u.id} name={u.name} last={u.email} unread={0} onPress={() => router.replace({ pathname: '/chat', params: { klant: u.id } })} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 20 },
});
