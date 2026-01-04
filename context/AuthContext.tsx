import { createContext, useState, useEffect, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "@env"
import { Alert } from "react-native";

type User = {
    email: string;
    access: string;
    refresh: string;
    csrf: string;
    tokenSetAt?: number;
    refreshCount?: number;
};

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: any }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        if (user?.tokenSetAt) {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
            }

            const currentTime = Date.now();
            const tokenAge = currentTime - user.tokenSetAt;
            const sixMinutes = 6 * 60 * 1000;
            const timeUntilRefresh = sixMinutes - tokenAge;

            if (timeUntilRefresh <= 0) {
                refreshToken();
            } else {
                refreshTimerRef.current = setTimeout(() => {
                    refreshToken();
                }, timeUntilRefresh);
            }

            return () => {
                if (refreshTimerRef.current) {
                    clearTimeout(refreshTimerRef.current);
                    refreshTimerRef.current = null;
                }
            };
        }
    }, [user?.tokenSetAt]);

    const loadUserData = async () => {
        try {
            const userJson = await AsyncStorage.getItem('user');
            if (userJson) {
                const userData = JSON.parse(userJson);

                if (userData.tokenSetAt) {
                    const currentTime = Date.now();
                    const tokenAge = currentTime - userData.tokenSetAt;
                    const sixMinutes = 6 * 60 * 1000;
  
                    if (tokenAge >= sixMinutes) {  
                        console.log('Token vaxti bitdi');      
                    }
                }
     
                setUser(userData);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    async function login(email: string, password: string) {
        try {
            const payload = { email, password };

            const response = await fetch(`${API_URL}/api/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert(data.detail);
                return;
            }

            const userData: User = {
                email: data.email,
                access: data.access,
                refresh: data.refresh,
                csrf: data.csrf,
                tokenSetAt: Date.now(),
                refreshCount: 0,
            };

            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            console.log('login successful');
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async function refreshToken() {
        try {
            if (!user?.refresh) {
                throw new Error('No refresh token available');
            }

            const currentRefreshCount = user.refreshCount || 0;

            if (currentRefreshCount >= 2) {
                Alert.alert('Session Expired', 'Please login again'); 
                await logOut();
                return;
            }
            const payload = { refresh: user.refresh };
            const response = await fetch(`${API_URL}/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(`Token refresh failed: ${response.status}`);
            }

            let data;
            try {
                data = JSON.parse(responseText);
                console.log(responseText)
                console.log(response)
                console.log('token yenilendi successfully');
            } catch (err: any) {
                throw new Error(err);
            }

            const updatedUser = {
                ...user,
                access: data.access,
                tokenSetAt: Date.now(),
                refreshCount: currentRefreshCount + 1,
            };

            console.log(`Refresh count: ${updatedUser.refreshCount}`);

            setUser(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

            return data;
        } catch (error) {
            console.error(error);
            await logOut();
            throw error;
        }
    }

    async function logOut() {
        try {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }

            if (user?.refresh) {
                const payload = { refresh: user.refresh };
                console.log(payload)
                const response = await fetch(`${API_URL}/api/logout/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.access}`
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    console.error('Logout API call failed:', response.status);
                } else {
                    console.log('Logout API call successful');
                }        
            }
        } catch (error) {
        } finally {      
            setUser(null);
            await AsyncStorage.removeItem('user');
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