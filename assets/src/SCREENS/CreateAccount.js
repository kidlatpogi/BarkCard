import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, View, StyleSheet, Image, Platform, KeyboardAvoidingView, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import styles from '../STYLES/CreateAccount.styles';

import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Password policy: max 24 chars, at least 1 upper, 1 lower, 1 number
const MAX_PASSWORD_LENGTH = 24;
const validatePassword = (pwd) => {
  if (!pwd) return 'Password is required';
  if (pwd.length > MAX_PASSWORD_LENGTH) return `Password must be at most ${MAX_PASSWORD_LENGTH} characters`;
  if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
  return null;
};

export default function CreateAccount({ onCreated, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (em) => em && em.includes('@');

  const isPasswordValid = () => validatePassword(password) === null;
  const doPasswordsMatch = () => password === confirm && password.length > 0;
  const formValid = () => {
    return isValidEmail(email) && isPasswordValid() && doPasswordsMatch();
  };

  const handleCreate = async () => {
    setError('');
    if (!email) return setError('Please enter your email');
    if (!isValidEmail(email)) return setError('Please enter a valid email address');
    if (password !== confirm) return setError('Passwords do not match');

    const pwdErr = validatePassword(password);
    if (pwdErr) return setError(pwdErr);

    if (!auth) return setError('Authentication is not configured');

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Send email verification (default flow)
      try {
        // NOTE: Using a custom continue URL requires that the domain is added to
        // the Firebase project's Authorized Domains. If you don't need a
        // continue URL, use the default sendEmailVerification, which avoids
        // the 'auth/unauthorized-continue-uri' error.
        await sendEmailVerification(user);
        console.log('✅ Email verification sent successfully to', user.email);

        // Ensure a single user document exists at tbl_User/{uid}
        try {
          await setDoc(doc(db, 'tbl_User', user.uid), {
            uid: user.uid,
            email: user.email,
            createdAt: serverTimestamp(),
            role: 'user',
            emailVerified: false
          }, { merge: true });
          console.log('✅ User document created/updated in Firestore at tbl_User/' + user.uid);
        } catch (e) {
          console.error('❌ Failed to write tbl_User:', e?.code || e?.message || e);
          const code = e?.code || e?.message || '';
          if (typeof code === 'string' && code.toLowerCase().includes('permission')) {
            Alert.alert(
              'Permission denied',
              'Could not create user document due to Firestore security rules. You can open the Firestore Rules console to review or adjust rules.',
              [
                { text: 'Open Rules', onPress: () => Linking.openURL('https://console.firebase.google.com/project/dm-bcv4/firestore/rules') },
                { text: 'OK', style: 'cancel' }
              ]
            );
          }
        }

        // Sign out the user so they must verify before logging in
        try {
          await signOut(auth);
          console.log('✅ User signed out after account creation');
        } catch (soErr) {
          console.warn('⚠️ Failed to sign out after account creation', soErr?.message || soErr);
        }

        setLoading(false);
        Alert.alert(
          'Check Your Email',
          `We've sent a verification link to ${email}. Please check your inbox (and spam folder) and click the link to verify your account.\n\nAfter verifying, you can log in.`,
          [
            { 
              text: 'OK', 
              onPress: () => { 
                if (onCreated) onCreated({ email: user.email, uid: user.uid, fromSignup: true }); 
              } 
            }
          ]
        );
      } catch (ve) {
        console.error('❌ Verification email failed:', ve);
        console.error('Error code:', ve?.code);
        console.error('Error message:', ve?.message);
        
        setLoading(false);
        
        // Provide more specific error messages
        let errorMessage = 'Could not send verification email. ';
        
        if (ve?.code === 'auth/too-many-requests') {
          errorMessage += 'Too many attempts. Please try again later.';
        } else if (ve?.code === 'auth/invalid-email') {
          errorMessage += 'The email address is invalid.';
        } else if (ve?.code === 'auth/user-disabled') {
          errorMessage += 'This account has been disabled.';
        } else {
          errorMessage += 'Please check your Firebase settings and try again.';
        }
        
        Alert.alert('Email Verification Failed', errorMessage);
      }
    } catch (err) {
      setLoading(false);
      console.error('❌ Account creation error:', err);
      const code = err?.code || err?.message || '';
      
      if (code.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists');
      } else if (code.includes('auth/invalid-email')) {
        setError('Invalid email address');
      } else if (code.includes('auth/weak-password')) {
        setError('Password is too weak');
      } else if (code.includes('auth/operation-not-allowed')) {
        setError('Email/password accounts are not enabled. Please contact support.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Image source={require('../IMAGES/BarkCardLogo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.heading}>Create your BarkCard</Text>
            <Text style={styles.subheading}>Use your email to sign up and manage your money securely.</Text>
          </View>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#9ca3af"
            />

            <View style={local.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => setPassword(t)}
                maxLength={MAX_PASSWORD_LENGTH}
                placeholderTextColor="#9ca3af"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity style={local.iconToggle} onPress={() => setShowPassword(!showPassword)} accessible accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#2f80ed" />
              </TouchableOpacity>
            </View>

            <View style={local.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Confirm Password"
                secureTextEntry={!showConfirm}
                value={confirm}
                onChangeText={(t) => setConfirm(t)}
                maxLength={MAX_PASSWORD_LENGTH}
                placeholderTextColor="#9ca3af"
                onFocus={() => setConfirmFocused(true)}
                onBlur={() => setConfirmFocused(false)}
              />
              <TouchableOpacity style={local.iconToggle} onPress={() => setShowConfirm(!showConfirm)} accessible accessibilityLabel={showConfirm ? 'Hide confirm password' : 'Show confirm password'}>
                <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color="#2f80ed" />
              </TouchableOpacity>
            </View>

            {passwordFocused ? (
              <View style={styles.validation}>
                <Text style={styles.validationTitle}>Password requirements</Text>
                <Text style={password.length === 0 ? styles.neutral : /[A-Z]/.test(password) ? styles.valid : styles.invalid}>• 1 uppercase letter</Text>
                <Text style={password.length === 0 ? styles.neutral : /[a-z]/.test(password) ? styles.valid : styles.invalid}>• 1 lowercase letter</Text>
                <Text style={password.length === 0 ? styles.neutral : /[0-9]/.test(password) ? styles.valid : styles.invalid}>• 1 number</Text>
                <Text style={confirm.length === 0 ? styles.neutral : doPasswordsMatch() ? styles.valid : styles.invalid}>• Passwords match</Text>
              </View>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={[styles.primaryButton]} onPress={handleCreate} activeOpacity={0.85} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
            </TouchableOpacity>

            {!formValid() ? (
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: '#6b7280', marginBottom: 6 }}>Please resolve the following before creating an account:</Text>
                {!isValidEmail(email) ? <Text style={{ color: '#ef4444' }}>• Enter a valid email address</Text> : null}
                {!isPasswordValid() ? <Text style={{ color: '#ef4444' }}>• Password must be 1 upper, 1 lower, 1 number, max 24 chars</Text> : null}
                {!doPasswordsMatch() ? <Text style={{ color: '#ef4444' }}>• Passwords must match</Text> : null}
              </View>
            ) : null}

            <TouchableOpacity style={styles.linkButton} onPress={onCancel}>
              <Text style={styles.linkText}>Already have an account? Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggle: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  iconToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 6,
  }
});