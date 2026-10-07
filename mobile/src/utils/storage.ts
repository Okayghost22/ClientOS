import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Memory fallback in case native storage fails on web or certain Expo environments
const memoryStorage: Record<string, string> = {};

export const storage = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            if (Platform.OS === 'web') {
                return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : memoryStorage[key] || null;
            }
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            return memoryStorage[key] || null;
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        try {
            memoryStorage[key] = value;
            if (Platform.OS === 'web') {
                if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
            } else {
                await SecureStore.setItemAsync(key, value);
            }
        } catch (error) {
            console.warn('SecureStore setItem failed, fallback to memory', error);
        }
    },
    removeItem: async (key: string): Promise<void> => {
        try {
            delete memoryStorage[key];
            if (Platform.OS === 'web') {
                if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
            } else {
                await SecureStore.deleteItemAsync(key);
            }
        } catch (error) {
            // Ignore error
        }
    }
};
