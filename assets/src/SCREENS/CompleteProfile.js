import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import styles from '../STYLES/CompleteProfile.styles';
import AddressPicker from '../COMPONENTS/AddressPicker';
import { db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Updated student number validation: YYYY-###### to YYYY-######## (6-8 digits)
const STUDENT_REGEX = /^\d{4}-\d{6,8}$/;

export default function CompleteProfile({ user, onComplete, onCancel, isEditMode = false }) {
  console.log('=== CompleteProfile Debug ===');
  console.log('isEditMode:', isEditMode);
  console.log('user object:', JSON.stringify(user, null, 2));
  console.log('v_FirstName:', user?.v_FirstName);
  console.log('v_LastName:', user?.v_LastName);
  console.log('v_StudentId:', user?.v_StudentId);
  console.log('=============================');
  
  // Helper to reformat student ID with dash
  const formatStudentId = (storedId) => {
    if (!storedId) return '';
    if (storedId.length >= 10 && !storedId.includes('-')) {
      const year = storedId.substring(0, 4);
      const rest = storedId.substring(4);
      return `${year}-${rest}`;
    }
    return storedId;
  };
  
  // Initialize with user data if in edit mode
  const [firstName, setFirstName] = useState(isEditMode && user ? (user.v_FirstName || '') : '');
  const [middleName, setMiddleName] = useState(isEditMode && user ? (user.v_MiddleName || '') : '');
  const [lastName, setLastName] = useState(isEditMode && user ? (user.v_LastName || '') : '');
  const [mobile, setMobile] = useState(isEditMode && user ? (user.v_PhoneNum || '') : '');
  const [studentNumber, setStudentNumber] = useState(isEditMode && user ? formatStudentId(user.v_StudentId || '') : '');
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState(isEditMode && user ? (user.v_Region || '') : '');
  const [province, setProvince] = useState(isEditMode && user ? (user.v_Province || '') : '');
  const [municipality, setMunicipality] = useState(isEditMode && user ? (user.v_Municipality || '') : '');
  const [barangay, setBarangay] = useState(isEditMode && user ? (user.v_Barangay || '') : '');
  const [zipcode, setZipcode] = useState(isEditMode && user ? (user.v_ZipCode || '') : '');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Update address display when in edit mode
  useEffect(() => {
    if (isEditMode && user && (user.v_Barangay || user.v_Municipality || user.v_Province)) {
      const formatted = `${user.v_Barangay || ''}, ${user.v_Municipality || ''}, ${user.v_Province || ''}`;
      setAddress(formatted);
    }
  }, [isEditMode, user]);

  const validate = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (!mobile.trim()) e.mobile = 'Mobile number is required';
    if (!studentNumber.trim()) e.studentNumber = 'Student number is required';
    else if (!STUDENT_REGEX.test(studentNumber.trim())) e.studentNumber = 'Format: 2023-123456 (6-8 digits)';
    if (!region.trim()) e.region = 'Region is required';
    if (!province.trim()) e.province = 'Province is required';
    if (!municipality.trim()) e.municipality = 'Municipality is required';
    if (!barangay.trim()) e.barangay = 'Barangay is required';
    if (!zipcode.trim()) e.zipcode = 'Zip code is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Placeholder: in a real app we'd save this to Firestore or call a server endpoint
      // For now just call onComplete with the profile data
      const profile = { firstName, middleName, lastName, mobile, studentNumber, region, province, municipality, barangay, address, zipcode };

      // Persist to Firestore tbl_User/{uid} with v_ prefixed fields
      try {
        if (!user || !user.uid) throw new Error('Missing user UID');
        const uid = user.uid;
        const userDoc = doc(db, 'tbl_User', uid);
        // Remove dash from student number before saving to database
        const studentIdWithoutDash = studentNumber ? studentNumber.replace(/-/g, '') : '';
        const payload = {
          v_CardUID: null,
          v_CreatedAt: serverTimestamp(),
          v_DateofBirth: null,
          v_FirstName: firstName,
          v_MiddleName: middleName || null,
          v_LastName: lastName,
          v_NFCId: null,
          v_PhoneNum: mobile || null,
          v_Status: 'active',
          v_StudentBalance: isEditMode ? (user.v_StudentBalance || 0) : 0,
          v_StudentId: studentIdWithoutDash,
          v_StudentTotalExpenses: isEditMode ? (user.v_StudentTotalExpenses || 0) : 0,
          v_StudentTotalIncome: isEditMode ? (user.v_StudentTotalIncome || 0) : 0,
          v_UserEmail: user.email || null,
          v_UserRole: 'Student',
          v_ZipCode: zipcode || null,
          // Address pieces
          v_Region: region || null,
          v_Province: province || null,
          v_Municipality: municipality || null,
          v_Barangay: barangay || null,
          // Mark profile as completed so we don't show this screen again
          v_ProfileComplete: true,
        };
        await setDoc(userDoc, payload, { merge: true });
        console.log('Saved tbl_User/' + uid);
      } catch (e) {
        console.error('Failed to save tbl_User', e);
      }

      setLoading(false);
      if (onComplete) onComplete(profile);
    } catch (err) {
      setLoading(false);
      Alert.alert('Save failed', 'Could not save profile. Please try again.');
    }
  };

  const renderContent = () => (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {isEditMode && onCancel && (
        <TouchableOpacity 
          onPress={onCancel} 
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#f5c842" />
          <Text style={{ marginLeft: 8, fontSize: 16, color: '#f5c842', fontWeight: '500' }}>Back</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{isEditMode ? 'Edit Profile' : 'Complete your profile'}</Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>First Name</Text>
              <TextInput value={firstName} onChangeText={setFirstName} placeholder="First name" style={styles.input} placeholderTextColor="#9ca3af" />
              {errors.firstName ? <Text style={styles.err}>{errors.firstName}</Text> : null}
            </View>
            <View style={[styles.col, { marginLeft: 12 }]}>
              <Text style={styles.label}>Middle Name</Text>
              <TextInput value={middleName} onChangeText={setMiddleName} placeholder="Middle name" style={styles.input} placeholderTextColor="#9ca3af" />
            </View>
            <View style={[styles.col, { marginLeft: 12 }]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput value={lastName} onChangeText={setLastName} placeholder="Last name" style={styles.input} placeholderTextColor="#9ca3af" />
              {errors.lastName ? <Text style={styles.err}>{errors.lastName}</Text> : null}
            </View>
          </View>

          <View style={styles.rowStack}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput value={mobile} onChangeText={setMobile} placeholder="09XXXXXXXXX" keyboardType="phone-pad" style={styles.input} placeholderTextColor="#9ca3af" />
              {errors.mobile ? <Text style={styles.err}>{errors.mobile}</Text> : null}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>Student Number</Text>
              <TextInput value={studentNumber} onChangeText={setStudentNumber} placeholder="2023-123456" style={styles.input} placeholderTextColor="#9ca3af" />
              {errors.studentNumber ? <Text style={styles.err}>{errors.studentNumber}</Text> : null}
            </View>
          </View>

          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>Region</Text>
            <TouchableOpacity style={styles.addressPicker} onPress={() => setPickerVisible(true)}>
              <Text style={styles.addressText}>{region || 'Select Region'}</Text>
              <Text style={styles.addressHint}>Tap to pick</Text>
            </TouchableOpacity>
            {errors.region ? <Text style={styles.err}>{errors.region}</Text> : null}
          </View>

          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>Province</Text>
            <Text style={styles.readOnly}>{province || '-'}</Text>
            {errors.province ? <Text style={styles.err}>{errors.province}</Text> : null}
          </View>

          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>Municipality / City</Text>
            <Text style={styles.readOnly}>{municipality || '-'}</Text>
            {errors.municipality ? <Text style={styles.err}>{errors.municipality}</Text> : null}
          </View>

          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>Barangay</Text>
            <Text style={styles.readOnly}>{barangay || '-'}</Text>
            {errors.barangay ? <Text style={styles.err}>{errors.barangay}</Text> : null}
          </View>

          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>Zip Code</Text>
            <TextInput value={zipcode} onChangeText={setZipcode} placeholder="Zip code" style={styles.input} keyboardType="numeric" placeholderTextColor="#9ca3af" />
            {errors.zipcode ? <Text style={styles.err}>{errors.zipcode}</Text> : null}
          </View>

          <AddressPicker visible={pickerVisible} onClose={() => setPickerVisible(false)} onSelect={(res) => {
            // res: { region, province, city, barangay }
            setRegion(res.region ? res.region.name || res.region.region_name : '');
            setProvince(res.province ? res.province.name || res.province.province_name : '');
            setMunicipality(res.city ? res.city.name || res.city.city_name : '');
            setBarangay(res.barangay ? res.barangay.name || res.barangay.brgy_name : '');
            const formatted = `${res.barangay ? (res.barangay.name || res.barangay.brgy_name) : ''}, ${res.city ? (res.city.name || res.city.city_name) : ''}, ${res.province ? (res.province.name || res.province.province_name) : ''}`;
            setAddress(formatted);
            setPickerVisible(false);
          }} />

          <TouchableOpacity style={[styles.primaryButton, loading ? styles.disabled : null]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>{loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Complete Profile')}</Text>
          </TouchableOpacity>

      {/* Skip removed — profile completion is mandatory */}
    </ScrollView>
  );

  // Try to load the background image, fallback to solid color if not available
  let backgroundImageSource;
  try {
    backgroundImageSource = require('../IMAGES/building-background.jpg');
  } catch (e) {
    backgroundImageSource = null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isEditMode ? "auto" : "light"} />
      {!isEditMode && backgroundImageSource ? (
        <ImageBackground 
          source={backgroundImageSource} 
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.overlay} />
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            {renderContent()}
          </KeyboardAvoidingView>
        </ImageBackground>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {renderContent()}
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
