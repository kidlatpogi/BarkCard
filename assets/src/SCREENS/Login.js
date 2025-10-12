import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import styles from '../STYLES/CreateAccount.styles';

// Firebase auth
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut, sendEmailVerification, reload } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function Login({ onLogin, onCreateNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        // Reload user from server to ensure emailVerified is up-to-date
        try {
          await reload(user);
        } catch (reloadErr) {
          console.warn('Failed to reload user after sign-in', reloadErr?.message || reloadErr);
        }
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
        // Persist a minimal user doc in tbl_User/{uid} only if it doesn't exist (first-time login)
        try {
          if (user && user.uid) {
            const uid = user.uid;
            const userDocRef = doc(db, 'tbl_User', uid);
            const existing = await getDoc(userDocRef);
            if (!existing.exists()) {
              const payload = {
                v_CardUID: null,
                v_CreatedAt: serverTimestamp(),
                v_DateofBirth: null,
                v_FirstName: null,
                v_LastName: null,
                v_NFCId: null,
                v_PhoneNum: null,
                v_Status: 'active',
                v_StudentBalance: 0,
                v_StudentId: null,
                v_StudentTotalExpenses: 0,
                v_StudentTotalIncome: 0,
                v_UserEmail: user.email || null,
                v_UserRole: 'Student'
              };
              await setDoc(userDocRef, payload, { merge: true });
              console.log('Created tbl_User/' + uid);
            } else {
              console.log('tbl_User/' + uid + ' already exists — skipping create');
            }
          }
        } catch (e) {
          console.error('Failed to save tbl_User', e);
          const code = e?.code || e?.message || '';
          if (typeof code === 'string' && code.toLowerCase().includes('permission')) {
            Alert.alert(
              'Permission denied',
              'App cannot write to Firestore because of security rules. You can open the Firestore Rules console to adjust permissions.',
              [
                { text: 'Open Rules', onPress: () => Linking.openURL('https://console.firebase.google.com/project/dm-bcv4/firestore/rules') },
                { text: 'OK', style: 'cancel' }
              ]
            );
          }
        }

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

        <View style={[styles.input, { flexDirection: 'row', alignItems: 'center' }]}> 
          <TextInput
            style={{ flex: 1, paddingVertical: 0, color: '#0f172a' }}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 8, padding: 8 }} accessibilityLabel="Toggle password visibility">
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#2f80ed" />
          </TouchableOpacity>
        </View>

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