import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Login from './assets/src/SCREENS/Login';
import HomeScreen from './assets/src/SCREENS/HomeScreen';

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = ({ email, uid }) => {
    setUser({ email, uid });
  };

  const handleLogout = () => setUser(null);

  return (
    <SafeAreaView style={styles.container}>
      {user ? <HomeScreen user={user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
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
