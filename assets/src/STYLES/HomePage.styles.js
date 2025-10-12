import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greeting: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '600'
  },
  studentId: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4
  },
  avatarWrap: {
    alignItems: 'center'
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e6eef9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarInitial: {
    color: '#08306b',
    fontWeight: '700'
  },

  balanceCard: {
    backgroundColor: '#12337a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    color: '#cfe2ff',
    fontSize: 12,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 6
  },
  balanceAction: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  balanceActionText: {
    color: '#12337a',
    fontWeight: '600'
  },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  action: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center'
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eef6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  actionLabel: {
    fontSize: 12,
    color: '#0f172a'
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    borderRadius: 10,
    padding: 12,
    alignItems: 'flex-start'
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280'
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
    color: '#0f172a'
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#0f172a'
  },
  sectionLink: {
    color: '#2f80ed'
  },

  emptyRecent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center'
  },
  emptyImage: {
    width: 60,
    height: 60,
    marginBottom: 8
  },
  emptyText: {
    fontWeight: '700',
    marginBottom: 4
  },
  emptySub: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center'
  },

  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2ff'
  },
  txTitle: { color: '#0f172a' },
  txAmount: { color: '#08306b', fontWeight: '700' }
});
