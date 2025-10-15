import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import styles from '../STYLES/Settings.styles';

export default function Settings({ user, onBack, onAccountDeactivated }) {
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleDeactivateAccount = async () => {
    if (confirmText.trim().toUpperCase() !== 'AGREED') {
      Alert.alert('Invalid Confirmation', 'Please type "AGREED" to confirm account deactivation.');
      return;
    }

    setLoading(true);
    try {
      if (!user || !user.uid) throw new Error('Missing user UID');
      
      const userDocRef = doc(db, 'tbl_User', user.uid);
      await updateDoc(userDocRef, {
        v_Status: 'deactivated'
      });

      setLoading(false);
      setShowDeactivateModal(false);
      Alert.alert(
        'Account Deactivated',
        'Your account has been deactivated successfully. You will be logged out.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onAccountDeactivated) onAccountDeactivated();
            }
          }
        ]
      );
    } catch (error) {
      setLoading(false);
      console.error('Failed to deactivate account:', error);
      Alert.alert('Error', 'Failed to deactivate account. Please try again.');
    }
  };

  const openDeactivateModal = () => {
    Alert.alert(
      'Deactivate Account',
      'Are you sure you want to deactivate your account? This action will disable your access to the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => setShowDeactivateModal(true)
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={onBack} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#2f80ed" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Manage Account</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || '-'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Student ID</Text>
                <Text style={styles.infoValue}>{user?.v_StudentId || '-'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account Status</Text>
                <View style={[styles.statusBadge, user?.v_Status === 'active' ? styles.statusActive : styles.statusInactive]}>
                  <Text style={styles.statusText}>{user?.v_Status || 'active'}</Text>
                </View>
              </View>
            </View>
          </View>
          {/* ...other settings sections... */}

          {/* Terms & Privacy Link */}
          <TouchableOpacity style={{ marginTop: 32, alignSelf: 'center' }} onPress={() => setShowPrivacy(true)}>
            <Text style={{ color: '#f5c842', textDecorationLine: 'underline', fontSize: 13 }}>Terms & Privacy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showDeactivateModal} animationType="slide" transparent={true} onRequestClose={() => setShowDeactivateModal(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(30,58,138,0.85)' }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={48} color="#ef4444" />
              <Text style={styles.modalTitle}>Confirm Deactivation</Text>
            </View>
            <Text style={styles.modalMessage}>
              This will deactivate your account and you will lose access to BarkCard services.
            </Text>
            <Text style={styles.modalInstruction}>
              Type <Text style={styles.modalKeyword}>AGREED</Text> below to confirm:
            </Text>
            <TextInput
              style={styles.modalInput}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="Type AGREED"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowDeactivateModal(false);
                  setConfirmText('');
                }}
                disabled={loading}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton, loading && styles.modalButtonDisabled]}
                onPress={handleDeactivateAccount}
                disabled={loading}
              >
                <Text style={styles.modalConfirmText}>
                  {loading ? 'Deactivating...' : 'Deactivate'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Privacy Modal */}
      <Modal visible={showPrivacy} animationType="slide" transparent={true} onRequestClose={() => setShowPrivacy(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(30,58,138,0.95)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#1e3a8a', marginBottom: 12 }}>BarkCard – Privacy Policy</Text>
            <Text style={{ color: '#222', fontSize: 13, marginBottom: 8 }}>Last updated: October 15, 2025</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              <Text style={{ color: '#222', fontSize: 14, marginBottom: 10 }}>
                BarkCard respects your privacy. This policy explains how we collect, use, and protect your data.{"\n\n"}
                <Text style={{ fontWeight: 'bold' }}>Data We Collect</Text> – Basic info from your student ID (name, ID number, email), login credentials, and transaction details.{"\n"}
                <Text style={{ fontWeight: 'bold' }}>Use of Data</Text> – Used only for authentication, payments, balance tracking, and service improvement.{"\n"}
                <Text style={{ fontWeight: 'bold' }}>Data Security</Text> – All records are securely stored in Google Firebase, which uses encrypted databases and restricted access controls.{"\n"}
                <Text style={{ fontWeight: 'bold' }}>No Sharing</Text> – We don’t sell or share your personal data with third parties.{"\n"}
                <Text style={{ fontWeight: 'bold' }}>User Access</Text> – You may request to update or delete your data by contacting the BarkCard admin.{"\n"}
                <Text style={{ fontWeight: 'bold' }}>Cookies / Logs</Text> – Basic logs may be collected to maintain performance and security.{"\n"}
                <Text style={{ fontWeight: 'bold' }}>Updates</Text> – We may revise this policy; changes will be posted in-app. Continued use means you accept them.{"\n"}
                <Text style={{ fontWeight: 'bold' }}>Contact</Text> – For privacy questions or requests, email barkcard.adm1n@gmail.com.
              </Text>
            </ScrollView>
            <TouchableOpacity style={{ marginTop: 18, alignSelf: 'center' }} onPress={() => setShowPrivacy(false)}>
              <Text style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: 15 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
