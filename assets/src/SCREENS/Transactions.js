import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../STYLES/Transactions.styles';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default function Transactions({ user, onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, purchases, reloads

  // Real-time listener for all transactions
  useEffect(() => {
    const studentNumber = user?.v_StudentId || user?.studentId;
    
    if (!studentNumber) {
      console.log('⚠️  No student ID found in user profile');
      setLoading(false);
      return;
    }

    let unsubscribe = null;
    
    try {
      const transactionsRef = collection(db, 'tbl_Transactions');
      const q = query(
        transactionsRef,
        where('v_StudentId', '==', studentNumber),
        orderBy('v_Timestamp', 'desc')
      );

      unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('📊 All Transactions Query Result:');
          console.log('   - Student ID:', studentNumber);
          console.log('   - Total Transactions:', snapshot.size);
          
          const txList = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            let transactionType = 'Purchase';
            let transactionAmount = data.v_Total || data.v_TransactionAmount || 0;
            let title = 'Transaction';
            
            if (data.v_OrderId) {
              transactionType = 'Purchase';
              const itemNames = data.v_Items?.map(item => item.v_Name).join(', ') || 'Order';
              title = itemNames;
            } else if (data.v_TransactionType) {
              transactionType = data.v_TransactionType;
              title = data.v_TransactionType;
            }
            
            txList.push({
              id: doc.id,
              title,
              amount: transactionAmount,
              type: transactionType,
              timestamp: data.v_Timestamp,
              orderId: data.v_OrderId,
              items: data.v_Items,
              ...data
            });
          });
          
          setTransactions(txList);
          setLoading(false);
        },
        (error) => {
          console.error('❌ Error fetching all transactions:', error);
          setTransactions([]);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error setting up transaction listener:', error);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.v_StudentId, user?.studentId]);

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'purchases') return tx.type === 'Purchase';
    if (filter === 'reloads') return tx.type === 'Reload' || tx.type === 'Income';
    return true;
  });

  // Calculate totals
  const totalSpent = transactions
    .filter(tx => tx.type === 'Purchase')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const totalReloaded = transactions
    .filter(tx => tx.type === 'Reload' || tx.type === 'Income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const renderTransaction = ({ item }) => {
    const isIncome = item.type === 'Reload' || item.type === 'Income';
    const amountColor = isIncome ? '#10b981' : '#ef4444';
    
    return (
      <View style={styles.txCard}>
        <View style={styles.txInfo}>
          <Text style={styles.txTitle}>{item.title}</Text>
          {item.timestamp && (
            <Text style={styles.txTime}>
              {new Date(item.timestamp?.toDate ? item.timestamp.toDate() : item.timestamp).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          )}
          {item.orderId && (
            <Text style={styles.txOrderId}>Order: {item.orderId}</Text>
          )}
        </View>
        <Text style={[styles.txAmount, { color: amountColor }]}>
          {isIncome ? '+' : '-'}₱{Number(item.amount).toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Transactions</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
            ₱{Number(totalSpent).toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Reloaded</Text>
          <Text style={[styles.summaryValue, { color: '#10b981' }]}>
            ₱{Number(totalReloaded).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({transactions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'purchases' && styles.filterTabActive]}
          onPress={() => setFilter('purchases')}
        >
          <Text style={[styles.filterText, filter === 'purchases' && styles.filterTextActive]}>
            Purchases ({transactions.filter(tx => tx.type === 'Purchase').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'reloads' && styles.filterTabActive]}
          onPress={() => setFilter('reloads')}
        >
          <Text style={[styles.filterText, filter === 'reloads' && styles.filterTextActive]}>
            Reloads ({transactions.filter(tx => tx.type === 'Reload' || tx.type === 'Income').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading transactions...</Text>
        </View>
      ) : filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>No transactions found</Text>
          <Text style={styles.emptySub}>
            {filter === 'all' 
              ? 'Your transaction history will appear here' 
              : `No ${filter} transactions yet`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={item => item.id}
          renderItem={renderTransaction}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
