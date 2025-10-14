import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Alert, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../STYLES/Support.styles';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Support({ user, onBack }) {
  const [activeTab, setActiveTab] = useState('faqs'); // 'faqs' or 'contact'
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  // Form states
  const [email, setEmail] = useState(user?.email || '');
  const [serviceType, setServiceType] = useState('');
  const [issueCategory, setIssueCategory] = useState('');
  const [atMerchant, setAtMerchant] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // Dropdown states
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showIssueCategoryDropdown, setShowIssueCategoryDropdown] = useState(false);
  const [showMerchantDropdown, setShowMerchantDropdown] = useState(false);
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);

  const faqs = [
    {
      id: 1,
      question: 'How do I reload my Bark Card?',
      answer: 'Message the Bark Card admin at barkcard.adm1n@gmail.com to reload your card. You can pay via cash or online transfer.'
    },
    {
      id: 2,
      question: 'What should I do if I lose my card?',
      answer: 'Immediately report the loss to the Bark Card admin to prevent unauthorized use. A replacement card can be issued for a minimal fee.'
    },
    {
      id: 3,
      question: 'Where can I use my Bark Card?',
      answer: 'You can use your Bark Card at selected campus establishments, including cafeterias and Bulldog Exchange.'
    }
  ];

  const serviceTypes = ['Account', 'Card Reload', 'Payment/Refund', 'Technical', 'Others'];
  const issueCategories = ['Login/Access', 'Wrong Charge', 'Missing Reload', 'Card Lost/Stolen', 'Bug/Crash', 'Others'];
  const merchantOptions = ['Yes', 'No'];
  const orderOptions = ['ORD-001 • Cafeteria', 'ORD-002 • Bulldog Exchange'];

  const handleSubmit = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    if (!serviceType) {
      Alert.alert('Error', 'Please select a service type');
      return;
    }
    if (!issueCategory) {
      Alert.alert('Error', 'Please select an issue category');
      return;
    }
    if (!atMerchant) {
      Alert.alert('Error', 'Please select if you are at the merchant\'s store');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Error', 'Please describe your issue');
      return;
    }

    try {
      // Build email content
      const supportEmail = 'barkcard.adm1n@gmail.com';
      const userName = `${user?.v_FirstName || ''} ${user?.v_LastName || ''}`.trim() || 'User';
      const studentId = user?.v_StudentId || user?.studentId || 'N/A';
      
      // Create detailed email body with explicit double line breaks for better formatting
      // Build readable email body with line breaks
      let emailBody = 'BARK CARD SUPPORT REQUEST\r\n\r\n';
      emailBody += '═══════════════════════════════════════\r\n\r\n';
      emailBody += 'USER INFORMATION:\r\n';
      emailBody += `Name: ${userName}\r\n`;
      emailBody += `Email: ${email}\r\n`;
      emailBody += `Student ID: ${studentId}\r\n`;
      emailBody += `User ID: ${user?.uid || 'N/A'}\r\n\r\n`;
      emailBody += '═══════════════════════════════════════\r\n\r\n';
      emailBody += 'ISSUE DETAILS:\r\n';
      emailBody += `Service Type: ${serviceType}\r\n`;
      emailBody += `Issue Category: ${issueCategory}\r\n`;
      emailBody += `At Merchant Store: ${atMerchant}\r\n`;
      if (selectedOrder) {
        emailBody += `Related Order: ${selectedOrder}\r\n`;
      }
      emailBody += '\r\n═══════════════════════════════════════\r\n\r\n';
      emailBody += 'SUBJECT:\r\n';
      emailBody += `${subject}\r\n\r\n`;
      emailBody += '═══════════════════════════════════════\r\n\r\n';
      emailBody += 'MESSAGE:\r\n';
      emailBody += `${message}\r\n\r\n`;
      emailBody += '═══════════════════════════════════════\r\n\r\n';
      emailBody += `Submitted on: ${new Date().toLocaleString()}`;

      // Save to Firestore for record keeping
      try {
        await addDoc(collection(db, 'tbl_SupportRequests'), {
          v_UserEmail: email,
          v_UserId: user?.uid || 'unknown',
          v_StudentId: studentId,
          v_UserName: userName,
          v_ServiceType: serviceType,
          v_IssueCategory: issueCategory,
          v_AtMerchant: atMerchant,
          v_SelectedOrder: selectedOrder || 'N/A',
          v_Subject: subject,
          v_Message: message,
          v_Status: 'pending',
          v_Timestamp: serverTimestamp()
        });
        console.log('Support request saved to Firestore');
      } catch (firestoreError) {
        console.error('Error saving to Firestore:', firestoreError);
        // Continue with email even if Firestore fails
      }

      // Encode entire body properly for mailto
      const encodedBody = encodeURIComponent(emailBody);
      const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodedBody}`;
      
      // Check if email can be opened
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        
        Alert.alert(
          'Opening Email',
          'Your email client will open with the support request. Please send the email to complete your submission.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setEmail(user?.email || '');
                setServiceType('');
                setIssueCategory('');
                setAtMerchant('');
                setSelectedOrder('');
                setSubject('');
                setMessage('');
              }
            }
          ]
        );
      } else {
        // Fallback: Show email details
        Alert.alert(
          'Email Support',
          `Please email us at:\n\n${supportEmail}\n\nSubject: ${subject}\n\nYour support request details have been saved. We will contact you at ${email}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setEmail(user?.email || '');
                setServiceType('');
                setIssueCategory('');
                setAtMerchant('');
                setSelectedOrder('');
                setSubject('');
                setMessage('');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting support request:', error);
      Alert.alert(
        'Error',
        'Failed to submit support request. Please try again or contact support directly at zeusbautista17@gmail.com'
      );
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Support Request',
      'Are you sure you want to discard this support request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            setEmail(user?.email || '');
            setServiceType('');
            setIssueCategory('');
            setAtMerchant('');
            setSelectedOrder('');
            setSubject('');
            setMessage('');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'faqs' && styles.tabActive]}
          onPress={() => setActiveTab('faqs')}
        >
          <Ionicons name="help-circle-outline" size={20} color={activeTab === 'faqs' ? '#2f80ed' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'faqs' && styles.tabTextActive]}>FAQs</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'contact' && styles.tabActive]}
          onPress={() => setActiveTab('contact')}
        >
          <Ionicons name="mail-outline" size={20} color={activeTab === 'contact' ? '#2f80ed' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'contact' && styles.tabTextActive]}>Customer Support</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'faqs' ? (
          // FAQs Section
          <View style={styles.faqsContainer}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {faqs.map((faq) => (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons 
                    name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
                {expandedFaq === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
            
            <View style={styles.contactPrompt}>
              <Ionicons name="chatbubbles-outline" size={32} color="#2f80ed" />
              <Text style={styles.contactPromptTitle}>Still need help?</Text>
              <Text style={styles.contactPromptText}>Contact our customer support team</Text>
              <TouchableOpacity 
                style={styles.contactPromptButton}
                onPress={() => setActiveTab('contact')}
              >
                <Text style={styles.contactPromptButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Customer Support Form
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Customer Support</Text>
            
            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email address <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Service Type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Service Type <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowServiceDropdown(!showServiceDropdown)}
              >
                <Text style={[styles.dropdownText, !serviceType && styles.dropdownPlaceholder]}>
                  {serviceType || 'Select service type'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#64748b" />
              </TouchableOpacity>
              {showServiceDropdown && (
                <View style={styles.dropdownMenu}>
                  {serviceTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setServiceType(type);
                        setShowServiceDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Issue Category */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Issue Category <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowIssueCategoryDropdown(!showIssueCategoryDropdown)}
              >
                <Text style={[styles.dropdownText, !issueCategory && styles.dropdownPlaceholder]}>
                  {issueCategory || 'Select issue category'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#64748b" />
              </TouchableOpacity>
              {showIssueCategoryDropdown && (
                <View style={styles.dropdownMenu}>
                  {issueCategories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setIssueCategory(category);
                        setShowIssueCategoryDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* At Merchant */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Are you currently at the merchant's store?</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowMerchantDropdown(!showMerchantDropdown)}
              >
                <Text style={[styles.dropdownText, !atMerchant && styles.dropdownPlaceholder]}>
                  {atMerchant || 'Yes/No'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#64748b" />
              </TouchableOpacity>
              {showMerchantDropdown && (
                <View style={styles.dropdownMenu}>
                  {merchantOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setAtMerchant(option);
                        setShowMerchantDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Select Order */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Order</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowOrderDropdown(!showOrderDropdown)}
              >
                <Text style={[styles.dropdownText, !selectedOrder && styles.dropdownPlaceholder]}>
                  {selectedOrder || 'Select order you need help with'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#64748b" />
              </TouchableOpacity>
              {showOrderDropdown && (
                <View style={styles.dropdownMenu}>
                  {orderOptions.map((order) => (
                    <TouchableOpacity
                      key={order}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedOrder(order);
                        setShowOrderDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{order}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Subject */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="Subject Title"
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            {/* Message */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your issue in detail."
                value={message}
                onChangeText={(text) => {
                  if (text.length <= 2000) {
                    setMessage(text);
                  }
                }}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{message.length}/2000</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
