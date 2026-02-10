import React, { useState, useEffect, useRef } from 'react';
import { AppState, View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { dbAPI } from './src/database/db';

import HomeScreen from './src/screens/HomeScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const init = async () => {
      try {
        await dbAPI.initDatabase();
        setIsReady(true);
        // Initial auth attempt
        handleAuthentication();
      } catch (e) {
        console.error("Initialization error:", e);
      }
    };
    init();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/active/) && nextAppState === 'background') {
        setIsLocked(true);
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  const handleAuthentication = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      setIsLocked(false);
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Mkwanja',
    });
    if (result.success) setIsLocked(false);
  };

  if (!isReady) return null;

  if (isLocked) {
    return (
      <SafeAreaView style={styles.lockContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.lockContent}>
          <Image source={require('./assets/images/icon.png')} style={styles.lockLogo} />
          <Text style={styles.lockTitle}>Mkwanja</Text>
          <Text style={styles.lockSubtitle}>Personal Finance Manager</Text>
          <TouchableOpacity style={styles.unlockButton} onPress={handleAuthentication}>
            <Text style={styles.unlockButtonText}>Unlock App</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.easterEgg}>
          <Text style={styles.easterEggText}>Mauwi Made</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: true,
            headerStyle: { backgroundColor: '#fff' },
            tabBarActiveTintColor: '#007bff',
            tabBarStyle: { backgroundColor: '#fff', height: 60, paddingBottom: 10 }
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ tabBarIcon: ({color}) => <Ionicons name="wallet" size={24} color={color} /> }}
          />
          <Tab.Screen 
            name="Add" 
            component={AddExpenseScreen} 
            options={{ tabBarIcon: ({color}) => <Ionicons name="add-circle" size={24} color={color} /> }}
          />
          <Tab.Screen 
            name="Reports" 
            component={ReportsScreen} 
            options={{ tabBarIcon: ({color}) => <Ionicons name="pie-chart" size={24} color={color} /> }}
          />
          <Tab.Screen 
            name="Settings"
            options={{ tabBarIcon: ({color}) => <Ionicons name="settings" size={24} color={color} /> }}
          >
            {props => <SettingsScreen {...props} onLogout={() => setIsLocked(true)} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  lockContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  lockContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lockLogo: { width: 100, height: 100, borderRadius: 20, marginBottom: 15 },
  lockTitle: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  lockSubtitle: { fontSize: 14, color: '#666', marginTop: 5, fontWeight: '500' },
  unlockButton: { backgroundColor: '#007bff', paddingHorizontal: 50, paddingVertical: 15, borderRadius: 12, marginTop: 40 },
  unlockButtonText: { color: '#fff', fontWeight: 'bold' },
  easterEgg: { position: 'absolute', bottom: 30, width: '100%', alignItems: 'center' },
  easterEggText: { color: '#bbb', fontSize: 10, letterSpacing: 2 }
});