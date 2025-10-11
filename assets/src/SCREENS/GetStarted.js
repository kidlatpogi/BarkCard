import React from 'react';
import { Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import styles from '../STYLES/GetStarted.styles';

export default function GetStarted({ onContinue, onCreate }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.brandArea}>
        <View style={styles.logoWrap}>
          <Image source={require('../IMAGES/BarkCardLogo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.title}>BarkCard</Text>
        <Text style={styles.subtitle}>Smart Student Payment Solution.</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onContinue} activeOpacity={0.85}>
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
