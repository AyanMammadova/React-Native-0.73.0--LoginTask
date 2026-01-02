import { useState } from 'react';
import { StyleSheet, Text, TextInput, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>

        <TextInput
          value={email}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          value={password}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          onChangeText={setPassword}
          style={styles.input}
        />

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 48,
    backgroundColor: '#1F2933',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#F9FAFB',
    marginBottom: 14,
  },
  button: {
    height: 48,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
