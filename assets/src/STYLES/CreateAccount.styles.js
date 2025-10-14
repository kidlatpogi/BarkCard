import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1e3a8a',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#f5c842',
    fontWeight: '800',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  subheading: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 6,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    marginBottom: 12,
    paddingRight: 44, // reserve space for the eye icon
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  toggleText: {
    color: '#f5c842',
    fontWeight: '600',
  },
  validation: {
    marginTop: 6,
    marginBottom: 8,
  },
  validationTitle: {
    color: '#fff',
    marginBottom: 6,
  },
  neutral: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  valid: {
    color: '#10b981',
    marginBottom: 2,
  },
  invalid: {
    color: '#ff6b6b',
    marginBottom: 2,
  },
  errorText: {
    color: '#ff6b6b',
    marginTop: 6,
    marginBottom: 6,
  },
  primaryButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f5c842',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  linkText: {
    color: '#f5c842',
    fontWeight: '600',
  }
});

export default styles;
