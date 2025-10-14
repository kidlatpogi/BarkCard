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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            <TouchableOpacity 
              style={styles.dangerButton}
              onPress={openDeactivateModal}
              activeOpacity={0.8}
            >
              <Ionicons name="warning-outline" size={20} color="#ef4444" />
              <Text style={styles.dangerButtonText}>Deactivate Account</Text>
            </TouchableOpacity>
            <Text style={styles.dangerNote}>
              Deactivating your account will disable your access to BarkCard. You can contact support to reactivate.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Deactivate Confirmation Modal */}
      <Modal
        visible={showDeactivateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeactivateModal(false)}
      >
        <View style={styles.modalOverlay}>
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
    </SafeAreaView>
  );
}
