import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 20,
    paddingTop: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  col: {
    flex: 1,
  },
  rowStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6e9ef',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    color: '#0f172a',
  },
  addressPicker: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6e9ef',
  },
  addressText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  addressHint: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  readOnly: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6e9ef',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    color: '#0f172a',
    textAlignVertical: 'center',
    paddingTop: 12,
  },
  err: {
    color: '#ef4444',
    marginTop: 6,
  },
  primaryButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2f80ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  linkText: {
    color: '#374151',
    fontWeight: '600',
  }
});

export default styles;
