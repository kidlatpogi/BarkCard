import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import styles from '../STYLES/Login.styles.js';

// Firebase auth
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email) return setError('Please enter your email');
    if (!password) return setError('Please enter your password');

    // If Firebase auth is configured, attempt sign-in
    if (auth) {
      setLoading(true);
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const user = userCred.user;
        setLoading(false);
        if (onLogin) onLogin({ email: user.email, uid: user.uid });
      } catch (err) {
        setLoading(false);
        // Map common Firebase errors to friendlier messages
        const msg = err?.code || err?.message || 'Login failed';
        if (msg.includes('auth/user-not-found')) setError('No account found for this email');
        else if (msg.includes('auth/wrong-password')) setError('Incorrect password');
        else if (msg.includes('auth/invalid-email')) setError('Invalid email address');
        else setError('Login failed. Please check your credentials.');
      }
    } else {
      // Fallback: local testing without Firebase
      if (onLogin) onLogin({ email });
      else console.log('Login (no firebase):', email);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to BarkCard</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#999"
      />

      {error ? <Text style={{ color: 'red', marginTop: 6 }}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
      </TouchableOpacity>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}