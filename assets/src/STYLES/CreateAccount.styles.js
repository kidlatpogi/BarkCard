import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoWrap: {
    width: 150,
    height: 150,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  logoImage: {
    width: 150,
    height: 150,
    borderRadius: 40,

  },
  logoText: {
    fontSize: 28,
    color: '#2f80ed',
    fontWeight: '800',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  subheading: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6e9ef',
    paddingHorizontal: 12,
    marginBottom: 12,
    paddingRight: 44, // reserve space for the eye icon
    backgroundColor: '#fbfbff',
  },
  toggleText: {
    color: '#2f80ed',
    fontWeight: '600',
  },
  validation: {
    marginTop: 6,
    marginBottom: 8,
  },
  validationTitle: {
    color: '#334155',
    marginBottom: 6,
  },
  neutral: {
    color: '#6b7280',
    marginBottom: 2,
  },
  valid: {
    color: '#10b981',
    marginBottom: 2,
  },
  invalid: {
    color: '#ef4444',
    marginBottom: 2,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 6,
    marginBottom: 6,
  },
  primaryButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2f80ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
