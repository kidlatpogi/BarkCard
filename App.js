import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import GetStarted from './assets/src/SCREENS/GetStarted';
import Login from './assets/src/SCREENS/Login';
import CreateAccount from './assets/src/SCREENS/CreateAccount';
import HomePage from './assets/src/SCREENS/HomePage';
import CompleteProfile from './assets/src/SCREENS/CompleteProfile';
import { db } from './assets/src/firebaseConfig';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const unsubRef = useRef(null);
  // screen can be: 'getstarted' | 'login' | 'create' | 'home'
  const [screen, setScreen] = useState('getstarted');

  const handleLogin = ({ email, uid, fromSignup }) => {
    // If coming from sign-up flow, require email verification first and send user to Login
    if (fromSignup) {
      setUser(null);
      setScreen('login');
      return;
    }
    // Set up a real-time listener for the user's profile document so UI updates immediately
    try {
      // clear any existing listener
      if (unsubRef.current) {
        try { unsubRef.current(); } catch (e) { /* ignore */ }
        unsubRef.current = null;
      }
      // optimistic set while listener attaches
      setUser({ email, uid });
      const unsubscribe = onSnapshot(doc(db, 'tbl_User', uid), (snap) => {
        const data = snap.exists() ? snap.data() : {};
        const completed = !!data?.v_ProfileComplete;
        const displayName = (data?.v_FirstName || data?.v_LastName) ? `${data?.v_FirstName || ''} ${data?.v_LastName || ''}`.trim() : (data?.v_UserEmail || email);
        const studentId = data?.v_StudentId || '';
        const balance = data?.v_StudentBalance || 0;

        setUser({ email, uid, displayName, studentId, balance, ...data });
        setProfileComplete(completed);
        if (!completed) setScreen('completeProfile');
        else setScreen('home');
      }, (err) => {
        console.error('Failed to attach user profile listener', err);
        // fallback to single read if desired
        (async () => {
          try {
            const userDoc = await getDoc(doc(db, 'tbl_User', uid));
            const data = userDoc.exists() ? userDoc.data() : {};
            const completed = !!data?.v_ProfileComplete;
            const displayName = (data?.v_FirstName || data?.v_LastName) ? `${data?.v_FirstName || ''} ${data?.v_LastName || ''}`.trim() : (data?.v_UserEmail || email);
            const studentId = data?.v_StudentId || '';
            const balance = data?.v_StudentBalance || 0;
            setUser({ email, uid, displayName, studentId, balance, ...data });
            setProfileComplete(completed);
            if (!completed) setScreen('completeProfile');
            else setScreen('home');
          } catch (e) {
            console.error('Failed to read user profile on login', e);
            setUser({ email, uid });
            setProfileComplete(false);
            setScreen('completeProfile');
          }
        })();
      });
      unsubRef.current = unsubscribe;
    } catch (err) {
      console.error('Failed to initialize profile listener', err);
      setUser({ email, uid });
      setProfileComplete(false);
      setScreen('completeProfile');
    }
  };

  const handleLogout = () => setUser(null);
  // cleanup listener on logout
  useEffect(() => {
    return () => {
      if (unsubRef.current) {
        try { unsubRef.current(); } catch (e) { /* ignore */ }
        unsubRef.current = null;
      }
    };
  }, []);

  // Navigation helpers
  const goToLogin = () => setScreen('login');
  const goToCreate = () => setScreen('create');
  const goToGetStarted = () => setScreen('getstarted');

  return (
    <SafeAreaView style={styles.container}>
      {user ? (
        // If user exists, and profileComplete show HomePage, else show CompleteProfile
        screen === 'home' ? (
          <HomePage user={user} balance={0} onNavigate={(s) => {
            // Basic navigation mapping from HomePage quick actions
            if (s === 'Profile') setScreen('completeProfile');
            else if (s === 'Transactions') setScreen('home');
            else if (s === 'Reload') console.log('Navigate to Reload');
            else console.log('Navigate to', s);
          }} onLogout={() => { handleLogout(); goToLogin(); }} />
        ) : screen === 'completeProfile' ? (
          <CompleteProfile user={user} onComplete={(profile) => {
            // For now we just mark profileComplete true and go to home. Persisting profile is handled elsewhere.
            setProfileComplete(true);
            setScreen('home');
          }} onCancel={() => setScreen('home')} />
        ) : null
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
