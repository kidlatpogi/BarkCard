import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import styles from '../STYLES/CreateAccount.styles';

// Firebase auth
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut, sendEmailVerification } from 'firebase/auth';

export default function Login({ onLogin, onCreateNavigate }) {
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
        // If user's email is not verified, sign them out and keep them on the Login screen.
        if (!user.emailVerified) {
          setLoading(false);
          // Alert with resend option, sign out after user interacts
          Alert.alert(
            'Email not verified',
            'Your email address has not been verified. Please check your inbox for the verification link.',
            [
              { text: 'Resend email', onPress: async () => {
                  try {
                    await sendEmailVerification(user);
                    console.log('Resend email verification sent successfully to', user.email);
                    Alert.alert('Verification sent', 'A verification email has been sent. Please check your inbox.');
                  } catch (err) {
                    console.error('Resend verification email failed', err?.message || err);
                    Alert.alert('Failed to send', err?.message || 'Could not send verification email.');
                  } finally {
                    // Sign out after resend attempt
                    try {
                      await signOut(auth);
                    } catch (soErr) {
                      console.warn('Sign out failed after resend', soErr?.message || soErr);
                    }
                  }
                }
              },
              { text: 'OK', onPress: async () => {
                  // Sign out when OK is pressed
                  try {
                    await signOut(auth);
                  } catch (soErr) {
                    console.warn('Sign out failed on OK', soErr?.message || soErr);
                  }
                }
              }
            ]
          );
          return;
        }

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
    <SafeAreaView style={styles.screen}>
      <View style={styles.centerContainer}>
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Image source={require('../IMAGES/BarkCardLogo.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.heading}>Welcome to BarkCard</Text>
        </View>

        <View style={styles.card}>
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

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity onPress={async () => {
          if (!email) return setError('Enter your email to reset password');
          try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert('Password reset', 'If the email exists, a password reset link has been sent.');
          } catch (err) {
            const code = err?.code || err?.message || '';
            if (code.includes('auth/user-not-found')) setError('No account found for this email');
            else setError('Failed to send reset email');
          }
        }}>
          <Text style={[styles.linkText, { marginTop: 10, color: '#2f80ed' }]}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.8} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Log In</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={onCreateNavigate}>
          <Text style={styles.linkText}>Don't have an account? Create Account</Text>
        </TouchableOpacity>
        </View>
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}