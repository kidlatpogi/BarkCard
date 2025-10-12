import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StatusBar, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../STYLES/HomePage.styles';
import { Ionicons } from '@expo/vector-icons';

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

  const actions = [
    { icon: 'wallet', label: 'Reload', id: 'reload', onPress: () => onNavigate('Reload') },
    { icon: 'receipt', label: 'Transactions', id: 'tx', onPress: () => onNavigate('Transactions') },
    { icon: 'person', label: 'Profile', id: 'profile', onPress: () => onNavigate('Profile') },
    { icon: 'help-circle', label: 'Support', id: 'support', onPress: () => onNavigate('Support') }
  ];

  const stats = [
    { title: 'Total Income', value: '₱0.00', key: 'inc' },
    { title: 'Total Expenses', value: '₱0.00', key: 'exp' },
    { title: 'Transactions', value: '0', key: 'txcount' }
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
        <TouchableOpacity style={styles.balanceAction} onPress={() => onNavigate('Reload')}>
          <Text style={styles.balanceActionText}>Reload</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsRow}>
        {actions.map(a => <QuickAction key={a.id} icon={a.icon} label={a.label} onPress={a.onPress} />)}
      </View>

      <View style={styles.statsRow}>
        {stats.map(s => (
          <View style={styles.statCard} key={s.key}>
            <Text style={styles.statLabel}>{s.title}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
          </View>
        ))}
      </View>

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
        <FlatList data={recent} keyExtractor={i => i.id} renderItem={({ item }) => (
          <View style={styles.txRow}>
            <Text style={styles.txTitle}>{item.title}</Text>
            <Text style={styles.txAmount}>{item.amount}</Text>
          </View>
        )} />
      )}

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setMenuVisible(false)}>
          <View style={{ position: 'absolute', right: 16, top: 80, backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8, width: 160, elevation: 4 }}>
            <TouchableOpacity style={{ padding: 12 }} onPress={() => { setMenuVisible(false); onNavigate && onNavigate('Settings'); }}>
              <Text style={{ color: '#0f172a' }}>Settings</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: '#eef2ff' }} />
            <TouchableOpacity style={{ padding: 12 }} onPress={() => { setMenuVisible(false); onLogout && onLogout(); }}>
              <Text style={{ color: '#ef4444' }}>Log out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}
