import React from 'react';
import { SafeAreaView, Text, TouchableOpacity } from 'react-native';
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
