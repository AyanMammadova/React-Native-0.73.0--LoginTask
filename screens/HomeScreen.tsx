import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';

export default function HomeScreen() {
  const { user, logOut, refreshToken } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
      
  useEffect(() => {
    checkAndRefreshToken();
  }, []);

  const checkAndRefreshToken = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');   
      if (!userJson) return;

      const userData = JSON.parse(userJson);

      if (userData.tokenSetAt) {
        const currentTime = Date.now()
        const tokenAge = currentTime - userData.tokenSetAt;
        const sixMinutes = 6 * 60 * 1000
        console.log(tokenAge / 1000 + ' seconds')
        if (tokenAge >= sixMinutes) {
          await refreshToken();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

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

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome </Text>
          <Text style={styles.userName}>{user?.email}</Text>
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >


        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>86%</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Menu</Text>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Profile Settings</Text>
            <Text style={styles.actionSubtitle}>Manage your account information</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Preferences</Text>
            <Text style={styles.actionSubtitle}>Customize your experience</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Notifications</Text>
            <Text style={styles.actionSubtitle}>3 unread notifications</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Payment Methods</Text>
            <Text style={styles.actionSubtitle}>Manage billing information</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#9CA3AF',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  userName: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'red',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  statValue: {
    color: '#F9FAFB',
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 8,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  actionArrow: {
    color: '#6B7280',
    fontSize: 28,
    fontWeight: '300',
  },
  bottomPadding: {
    height: 20,
  },
});