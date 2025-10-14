import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700'
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  filterTabActive: {
    backgroundColor: '#2f80ed',
    borderColor: '#2f80ed'
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b'
  },
  filterTextActive: {
    color: '#fff'
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  txInfo: {
    flex: 1,
    marginRight: 12
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4
  },
  txTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2
  },
  txOrderId: {
    fontSize: 11,
    color: '#cbd5e1',
    fontFamily: 'monospace'
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8
  },
  emptySub: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center'
  }
});
