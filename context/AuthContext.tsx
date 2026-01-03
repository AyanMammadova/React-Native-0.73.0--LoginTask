import { createContext, useState, useEffect, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from "@env"

type User = {
    email: string;
    access: string;
    refresh: string;
    csrf: string;
};

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: any }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load user data from AsyncStorage on app start
    useEffect(() => {
        loadUserData();
    }, []);

    // Set up automatic token refresh when user logs in
    useEffect(() => {
        if (user) {
            console.log('Setting up token refresh interval (every 6 minutes)');
            // Clear any existing interval
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }

            // Refresh token every 6 minutes (360000 ms)
            refreshIntervalRef.current = setInterval(() => {
                console.log('Auto-refreshing token...');
                refreshToken();
            }, 6 * 60 * 1000); // 6 minutes

            // Cleanup on unmount or when user logs out
            return () => {
                if (refreshIntervalRef.current) {
                    console.log('Clearing token refresh interval');
                    clearInterval(refreshIntervalRef.current);
                    refreshIntervalRef.current = null;
                }
            };
        }
    }, [user]);

    const loadUserData = async () => {
        try {
            console.log('Loading user data from AsyncStorage...');
            const userData = await AsyncStorage.getItem('user');
            console.log('Raw data from AsyncStorage:', userData);

            if (userData) {
                const parsedUser = JSON.parse(userData);
                console.log('Parsed user data:', parsedUser);
                setUser(parsedUser);
            } else {
                console.log('No user data found in AsyncStorage');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    async function login(email: string, password: string) {
        try {
            const response = await fetch(`${API_URL}/api/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData);
                throw new Error(errorData.detail || 'Login failed');
            }

            const data = await response.json();
            console.log('Full login response:', data);

            // Store essential user data
            const userData: User = {
                email: data.email,
                access: data.access,
                refresh: data.refresh,
                csrf: data.csrf,
            };

            console.log('Storing user data:', userData);
            console.log('Access Token:', userData.access);
            console.log('Refresh Token:', userData.refresh);
            console.log('CSRF Token:', userData.csrf);

            // Save to state
            setUser(userData);

            // Save to AsyncStorage
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            console.log('User data saved to AsyncStorage');

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async function refreshToken() {
        try {
            if (!user?.refresh) {
                throw new Error('No refresh token available');
            }

            console.log('Refreshing access token with refresh token:', user.refresh);

            const response = await fetch(`${API_URL}/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh: user.refresh
                }),
            });

            console.log('Refresh token response status:', response.status);
            console.log('Refresh token response headers:', response.headers);

            // Check content type before parsing
            const contentType = response.headers.get('content-type');
            console.log('Response content-type:', contentType);

            if (!response.ok) {
                const responseText = await response.text();
                console.error('Token refresh failed. Status:', response.status);
                console.error('Response body:', responseText);
                throw new Error(`Token refresh failed: ${response.status}`);
            }

            // Try to parse as JSON
            const responseText = await response.text();
            console.log('Raw response:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse JSON response:', responseText);
                throw new Error('Invalid JSON response from server');
            }

            console.log('Token refresh successful. New access token:', data.access);

            // Update user with new access token
            const updatedUser = {
                ...user,
                access: data.access,
            };

            setUser(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

            return data;
        } catch (error) {
            console.error('Token refresh error:', error);
            // If refresh fails, log out the user
            await logOut();
            throw error;
        }
    }

    async function logOut() {
        try {
            // Clear the refresh interval first
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }

            // Call logout endpoint with refresh token
            if (user?.refresh) {
                console.log('Calling logout API with refresh token:', user.refresh);
                const response = await fetch(`${API_URL}/api/logout/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.access}`,
                    },
                    body: JSON.stringify({
                        refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MDA2Mjc5OSwiaWF0IjoxNzY3NDcwNzk5LCJqdGkiOiJkN2Q3YzExMzcwMjI0YmEyYjFlY2E2YTQ1NjIyNjVlYiIsInVzZXJfaWQiOjQwfQ.eZh-4bDJ3yFmRpxDUAD9jF5_JOap7imuw-aMKFwvCPw'
                    }),
                });

                if (!response.ok) {
                    console.warn('Logout API returned error, but continuing with local logout');
                } else {
                    console.log('Logout API successful');
                }
            }
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Clear state and storage regardless of API result
            setUser(null);
            await AsyncStorage.removeItem('user');
            console.log('User logged out and data cleared');
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                refreshToken,
                logOut
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};