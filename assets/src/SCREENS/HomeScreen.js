import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import styles from '../STYLES/HomeScreen.styles';

export default function HomeScreen({ user, onLogout }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcome}>Hello{user && user.email ? `, ${user.email}` : ''}!</Text>

      <TouchableOpacity style={styles.button} onPress={onLogout} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
