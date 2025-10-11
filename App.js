import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import GetStarted from './assets/src/SCREENS/GetStarted';
import Login from './assets/src/SCREENS/Login';
import CreateAccount from './assets/src/SCREENS/CreateAccount';
import HomeScreen from './assets/src/SCREENS/HomeScreen';

export default function App() {
  const [user, setUser] = useState(null);
  // screen can be: 'getstarted' | 'login' | 'create' | 'home'
  const [screen, setScreen] = useState('getstarted');

  const handleLogin = ({ email, uid, fromSignup }) => {
    // If coming from sign-up flow, require email verification first and send user to Login
    if (fromSignup) {
      setUser(null);
      setScreen('login');
      return;
    }
    setUser({ email, uid });
    setScreen('home');
  };

  const handleLogout = () => setUser(null);

  // Navigation helpers
  const goToLogin = () => setScreen('login');
  const goToCreate = () => setScreen('create');
  const goToGetStarted = () => setScreen('getstarted');

  return (
    <SafeAreaView style={styles.container}>
      {user ? (
        <HomeScreen user={user} onLogout={() => { handleLogout(); goToLogin(); }} />
      ) : screen === 'getstarted' ? (
        // Make the primary Get Started action go directly to Create Account
        <GetStarted onContinue={goToCreate} onCreate={goToCreate} />
      ) : screen === 'create' ? (
        <CreateAccount onCreated={handleLogin} onCancel={goToLogin} />
      ) : (
        <Login onLogin={handleLogin} onCreateNavigate={goToCreate} />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
