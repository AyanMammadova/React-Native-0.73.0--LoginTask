import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, logOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Debug: Check what's in AsyncStorage directly
  useEffect(() => {
    const checkAsyncStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        console.log('=== Direct AsyncStorage Read ===');
        console.log('Raw stored data:', storedUser);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          console.log('Parsed User:', parsed);
          console.log('Email:', parsed.email);
          console.log('Access Token:', parsed.access);
          console.log('Refresh Token:', parsed.refresh);
          console.log('CSRF Token:', parsed.csrf);
        }
        console.log('================================');
      } catch (error) {
        console.error('Error reading AsyncStorage:', error);
      }
    };
    
    checkAsyncStorage();
  }, []);

  // Debug: Check what's in user from context
  useEffect(() => {
    console.log('=== User from AuthContext ===');
    console.log('Full User Object:', user);
    console.log('Email:', user?.email);
    console.log('Access Token:', user?.access);
    console.log('Refresh Token:', user?.refresh);
    console.log('CSRF Token:', user?.csrf);
    console.log('===========================');
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logOut();
              // Navigation will happen automatically when user becomes null
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
              setIsLoggingOut(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#111827" barStyle="light-content" />

      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.header}>Welcome, Ayan!</Text>
          {user?.email && <Text style={styles.email}>{user.email}</Text>}
        </View>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.logoutText}>Logout</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Orders</Text>
            <Text style={styles.cardValue}>24</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Messages</Text>
            <Text style={styles.cardValue}>12</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#111827',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    color: '#F9FAFB',
    fontSize: 28,
    fontWeight: '700',
  },
  email: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#1F2933',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 5,
  },
  cardTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  cardValue: {
    color: '#F9FAFB',
    fontSize: 22,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFF',
    fontWeight: '600',
  },
});