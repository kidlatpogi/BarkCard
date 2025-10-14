import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StatusBar, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../STYLES/HomePage.styles';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

const QuickAction = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.action} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.actionIcon}>
      <Ionicons name={icon} size={20} color="#2f80ed" />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function HomePage({ user, balance = 0, onNavigate, onLogout }) {
  const [recent, setRecent] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [transactionCount, setTransactionCount] = useState(0);

  // Real-time listener for transactions
  useEffect(() => {
    // Get student number from user profile (without the dash, as stored in database)
    const studentNumber = user?.v_StudentId || user?.studentId;
    
    if (!studentNumber) {
      console.log('⚠️  No student ID found in user profile');
      return;
    }

    let unsubscribe = null;
    
    try {
      // Query transactions using the student number (not Firebase Auth UID)
      const transactionsRef = collection(db, 'tbl_Transactions');
      const q = query(
        transactionsRef,
        where('v_StudentId', '==', studentNumber),
        orderBy('v_Timestamp', 'desc'),
        limit(5)
      );

      unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('📊 Transaction Query Result:');
          console.log('   - Student ID:', studentNumber);
          console.log('   - Transactions Found:', snapshot.size);
          
          const transactions = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Determine transaction type from the data
            let transactionType = 'Purchase'; // Default to Purchase for orders
            let transactionAmount = data.v_Total || 0;
            
            // If it's an order with items, it's a purchase
            if (data.v_OrderId) {
              transactionType = 'Purchase';
              // Get item names if available
              const itemNames = data.v_Items?.map(item => item.v_Name).join(', ') || 'Order';
              
              console.log('   - Transaction:', doc.id, 'Order:', data.v_OrderId, 'Total:', transactionAmount);
              
              transactions.push({
                id: doc.id,
                title: itemNames,
                amount: `₱${Number(transactionAmount).toFixed(2)}`,
                type: transactionType,
                timestamp: data.v_Timestamp,
                orderId: data.v_OrderId,
                items: data.v_Items,
                ...data
              });
            } else {
              // Handle other transaction types (Reload, Fee, etc.)
              console.log('   - Transaction:', doc.id, data.v_TransactionType || 'Unknown', transactionAmount);
              
              transactions.push({
                id: doc.id,
                title: data.v_TransactionType || 'Transaction',
                amount: `₱${Number(transactionAmount).toFixed(2)}`,
                type: data.v_TransactionType || 'Unknown',
                timestamp: data.v_Timestamp,
                ...data
              });
            }
          });
          
          setRecent(transactions);
          setTransactionCount(snapshot.size);
          
          if (snapshot.size === 0) {
            console.log('⚠️  No transactions found. Check:');
            console.log('   1. Does tbl_Transactions collection exist?');
            console.log('   2. Do transactions have v_StudentId =', studentNumber);
            console.log('   3. Is the Firestore index enabled?');
          }
        },
        (error) => {
          console.error('❌ Error fetching transactions:', error);
          console.error('   Error Code:', error.code);
          console.error('   Error Message:', error.message);
          
          // Check if it's an index error
          if (error.code === 'failed-precondition' && error.message.includes('index')) {
            console.log('📌 ACTION REQUIRED: Create the Firestore index by clicking the link above');
            console.log('   Once created, the transactions will load automatically (usually takes 1-2 minutes)');
            console.log('   Index needed: v_StudentId (Ascending) + v_Timestamp (Descending)');
          }
          
          // Reset to empty on error
          setRecent([]);
          setTransactionCount(0);
        }
      );
    } catch (error) {
      console.error('Error setting up transaction listener:', error);
    }

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.v_StudentId, user?.studentId]);

  const actions = [
    { icon: 'help-circle', label: 'Support', id: 'support', onPress: () => onNavigate('Support') }
  ];

  // Get income and expenses from user object (fetched from Firestore in real-time via App.js listener)
  const totalIncome = user?.v_StudentTotalIncome || user?.vStudentTotalIncome || 0;
  const totalExpenses = user?.v_StudentTotalExpenses || user?.vStudentTotalExpenses || 0;
  
  // Use transaction count from query, or fallback to user profile field if available
  const displayTransactionCount = transactionCount > 0 ? transactionCount : (user?.v_TransactionCount || 0);

  const stats = [
    { title: 'Total Income', value: `₱${Number(totalIncome).toFixed(2)}`, key: 'inc' },
    { title: 'Total Expenses', value: `₱${Number(totalExpenses).toFixed(2)}`, key: 'exp' },
    { title: 'Transactions', value: displayTransactionCount.toString(), key: 'txcount' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          {/* Build a display name from available profile fields */}
          {(() => {
            const first = user?.v_FirstName || user?.vFirstName || '';
            const last = user?.v_LastName || user?.vLastName || '';
            const displayFromFields = (first || last) ? `${first} ${last}`.trim() : null;
            const name = user?.displayName || displayFromFields || user?.email || 'User';
            return <Text style={styles.greeting}>Hi, {name}</Text>;
          })()}
          <Text style={styles.studentId}>Student ID: {user?.studentId || user?.v_StudentId || user?.vStudentId || '-'}</Text>
        </View>
        <View style={styles.avatarWrap}>
          <TouchableOpacity onPress={() => setMenuVisible(true)} activeOpacity={0.8}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{((user?.displayName || user?.v_FirstName || user?.vFirstName || 'U').charAt(0) || 'U').toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <View>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceValue}>₱{Number(balance).toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {stats.map(s => (
          <View style={styles.statCard} key={s.key}>
            <Text style={styles.statLabel}>{s.title}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
          </View>
        ))}
      </View>

      {/* Support Button - Full Width */}
      <TouchableOpacity 
        style={styles.supportButton} 
        onPress={() => onNavigate('Support')}
        activeOpacity={0.8}
      >
        <View style={styles.supportIcon}>
          <Ionicons name="help-circle" size={24} color="#2f80ed" />
        </View>
        <Text style={styles.supportText}>Need Help? Contact Support</Text>
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => onNavigate('Transactions')}>
          <Text style={styles.sectionLink}>View all</Text>
        </TouchableOpacity>
      </View>

      {recent.length === 0 ? (
        <View style={styles.emptyRecent}>
          <Image source={require('../IMAGES/BarkCardLogo.png')} style={styles.emptyImage} resizeMode="contain" />
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySub}>Your purchases, reloads, and fees will appear here in real time.</Text>
        </View>
      ) : (
        <FlatList 
          data={recent} 
          keyExtractor={i => i.id} 
          renderItem={({ item }) => {
            // Determine color based on transaction type
            const isIncome = item.type === 'Reload' || item.type === 'Income';
            const amountColor = isIncome ? '#10b981' : '#ef4444';
            
            return (
              <View style={styles.txRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txTitle}>{item.title}</Text>
                  {item.timestamp && (
                    <Text style={styles.txTime}>
                      {new Date(item.timestamp?.toDate ? item.timestamp.toDate() : item.timestamp).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  )}
                </View>
                <Text style={[styles.txAmount, { color: amountColor }]}>
                  {isIncome ? '+' : '-'}{item.amount}
                </Text>
              </View>
            );
          }} 
        />
      )}

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setMenuVisible(false)}>
          <View style={{ position: 'absolute', right: 16, top: 80, backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8, width: 160, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }} onPress={() => { setMenuVisible(false); onNavigate && onNavigate('Profile'); }}>
              <Ionicons name="person-outline" size={18} color="#0f172a" style={{ marginRight: 10 }} />
              <Text style={{ color: '#0f172a', fontSize: 15 }}>Edit Profile</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: '#eef2ff' }} />
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }} onPress={() => { setMenuVisible(false); onNavigate && onNavigate('Settings'); }}>
              <Ionicons name="settings-outline" size={18} color="#0f172a" style={{ marginRight: 10 }} />
              <Text style={{ color: '#0f172a', fontSize: 15 }}>Manage Account</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: '#eef2ff' }} />
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }} onPress={() => { setMenuVisible(false); onLogout && onLogout(); }}>
              <Ionicons name="log-out-outline" size={18} color="#ef4444" style={{ marginRight: 10 }} />
              <Text style={{ color: '#ef4444', fontSize: 15 }}>Log out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}
