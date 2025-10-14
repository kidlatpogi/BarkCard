import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import GetStarted from './assets/src/SCREENS/GetStarted';
import Login from './assets/src/SCREENS/Login';
import CreateAccount from './assets/src/SCREENS/CreateAccount';
import HomePage from './assets/src/SCREENS/HomePage';
import CompleteProfile from './assets/src/SCREENS/CompleteProfile';
import Settings from './assets/src/SCREENS/Settings';
import Transactions from './assets/src/SCREENS/Transactions';
import Support from './assets/src/SCREENS/Support';
import { db, auth } from './assets/src/firebaseConfig';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Track initial auth check
  const unsubRef = useRef(null);
  // screen can be: 'getstarted' | 'login' | 'create' | 'home' | 'completeProfile' | 'settings' | 'transactions' | 'support'
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
        if (!completed) {
          setIsEditMode(false);
          setScreen('completeProfile');
        } else {
          setScreen('home');
        }
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
            if (!completed) {
              setIsEditMode(false);
              setScreen('completeProfile');
            } else {
              setScreen('home');
            }
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

  const handleLogout = async () => {
    try {
      // Clear the Firestore listener first
      if (unsubRef.current) {
        try { unsubRef.current(); } catch (e) { /* ignore */ }
        unsubRef.current = null;
      }
      // Sign out from Firebase (this will trigger onAuthStateChanged)
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    // These will be set by onAuthStateChanged, but set immediately for smooth UX
    setUser(null);
    setScreen('login');
  };

  // Firebase Auth State Persistence - automatically restores session on app restart
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
      
      if (firebaseUser) {
        // User is logged in, fetch their profile
        const email = firebaseUser.email;
        const uid = firebaseUser.uid;
        
        // Check if email is verified
        if (!firebaseUser.emailVerified) {
          console.log('⚠️ Email not verified, redirecting to login');
          setUser(null);
          setScreen('login');
          setIsLoading(false);
          return;
        }

        // Set up real-time listener for user profile
        try {
          // Clear any existing listener
          if (unsubRef.current) {
            try { unsubRef.current(); } catch (e) { /* ignore */ }
            unsubRef.current = null;
          }

          // Optimistic set while listener attaches
          setUser({ email, uid });

          const unsubscribe = onSnapshot(doc(db, 'tbl_User', uid), (snap) => {
            const data = snap.exists() ? snap.data() : {};
            
            // Check if account is deactivated
            if (data?.v_Status === 'deactivated') {
              console.log('⚠️ Account deactivated, logging out');
              handleLogout();
              return;
            }

            const completed = !!data?.v_ProfileComplete;
            const displayName = (data?.v_FirstName || data?.v_LastName) 
              ? `${data?.v_FirstName || ''} ${data?.v_LastName || ''}`.trim() 
              : (data?.v_UserEmail || email);
            const studentId = data?.v_StudentId || '';
            const balance = data?.v_StudentBalance || 0;

            setUser({ email, uid, displayName, studentId, balance, ...data });
            setProfileComplete(completed);
            
            if (!completed) {
              setIsEditMode(false);
              setScreen('completeProfile');
            } else {
              setScreen('home');
            }
            setIsLoading(false);
          }, (err) => {
            console.error('Failed to attach user profile listener', err);
            // Fallback to single read
            (async () => {
              try {
                const userDoc = await getDoc(doc(db, 'tbl_User', uid));
                const data = userDoc.exists() ? userDoc.data() : {};
                
                // Check if account is deactivated
                if (data?.v_Status === 'deactivated') {
                  console.log('⚠️ Account deactivated, logging out');
                  handleLogout();
                  return;
                }

                const completed = !!data?.v_ProfileComplete;
                const displayName = (data?.v_FirstName || data?.v_LastName) 
                  ? `${data?.v_FirstName || ''} ${data?.v_LastName || ''}`.trim() 
                  : (data?.v_UserEmail || email);
                const studentId = data?.v_StudentId || '';
                const balance = data?.v_StudentBalance || 0;
                
                setUser({ email, uid, displayName, studentId, balance, ...data });
                setProfileComplete(completed);
                
                if (!completed) {
                  setIsEditMode(false);
                  setScreen('completeProfile');
                } else {
                  setScreen('home');
                }
                setIsLoading(false);
              } catch (e) {
                console.error('Failed to read user profile', e);
                setUser({ email, uid });
                setProfileComplete(false);
                setScreen('completeProfile');
                setIsLoading(false);
              }
            })();
          });
          
          unsubRef.current = unsubscribe;
        } catch (err) {
          console.error('Failed to initialize profile listener', err);
          setUser({ email, uid });
          setProfileComplete(false);
          setScreen('completeProfile');
          setIsLoading(false);
        }
      } else {
        // No user logged in
        setUser(null);
        setScreen('login');
        setIsLoading(false);
        
        // Clear Firestore listener
        if (unsubRef.current) {
          try { unsubRef.current(); } catch (e) { /* ignore */ }
          unsubRef.current = null;
        }
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribeAuth();
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
      {isLoading ? (
        // Show loading indicator while checking auth state
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#800000" />
        </View>
      ) : user ? (
        // If user exists, and profileComplete show HomePage, else show CompleteProfile
        screen === 'home' ? (
          <HomePage user={user} balance={user?.v_StudentBalance || user?.balance || 0} onNavigate={(s) => {
            // Basic navigation mapping from HomePage quick actions
            if (s === 'Profile') {
              setIsEditMode(true);
              setScreen('completeProfile');
            } else if (s === 'Settings') {
              setScreen('settings');
            } else if (s === 'Transactions') {
              setScreen('transactions');
            } else if (s === 'Support') {
              setScreen('support');
            } else if (s === 'Reload') {
              console.log('Navigate to Reload');
            } else {
              console.log('Navigate to', s);
            }
          }} onLogout={handleLogout} />
        ) : screen === 'completeProfile' ? (
          <CompleteProfile user={user} isEditMode={isEditMode} onComplete={(profile) => {
            // For now we just mark profileComplete true and go to home. Persisting profile is handled elsewhere.
            setProfileComplete(true);
            setScreen('home');
          }} onCancel={() => setScreen('home')} />
        ) : screen === 'settings' ? (
          <Settings 
            user={user} 
            onBack={() => setScreen('home')} 
            onAccountDeactivated={handleLogout}
          />
        ) : screen === 'transactions' ? (
          <Transactions 
            user={user} 
            onBack={() => setScreen('home')} 
          />
        ) : screen === 'support' ? (
          <Support 
            user={user} 
            onBack={() => setScreen('home')} 
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
