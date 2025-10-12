import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import styles from '../STYLES/CompleteProfile.styles';
import AddressPicker from '../COMPONENTS/AddressPicker';
import { db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// simple student number validation: YYYY-######
const STUDENT_REGEX = /^\d{4}-\d{6}$/;

export default function CompleteProfile({ user, onComplete }) {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [barangay, setBarangay] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (!mobile.trim()) e.mobile = 'Mobile number is required';
    if (!studentNumber.trim()) e.studentNumber = 'Student number is required';
    else if (!STUDENT_REGEX.test(studentNumber.trim())) e.studentNumber = 'Format: 2023-12345678';
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
        const payload = {
          v_CardUID: null,
          v_CreatedAt: serverTimestamp(),
          v_DateofBirth: null,
          v_FirstName: firstName,
          v_LastName: lastName,
          v_NFCId: null,
          v_PhoneNum: mobile || null,
          v_Status: 'active',
          v_StudentBalance: 0,
          v_StudentId: studentNumber || '',
          v_StudentTotalExpenses: 0,
          v_StudentTotalIncome: 0,
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Complete your profile</Text>

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
              <TextInput value={studentNumber} onChangeText={setStudentNumber} placeholder="2023-12345678" style={styles.input} placeholderTextColor="#9ca3af" />
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
            <Text style={styles.primaryButtonText}>{loading ? 'Saving...' : 'Complete Profile'}</Text>
          </TouchableOpacity>

          {/* Skip removed — profile completion is mandatory */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
