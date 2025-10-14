import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		justifyContent: 'center',
		backgroundColor: '#1e3a8a',
		alignItems: 'center',
	},
	title: {
		fontSize: 22,
		fontWeight: '600',
		marginBottom: 20,
		textAlign: 'center',
		color: '#fff',
	},
	input: {
		height: 48,
		borderColor: 'rgba(255, 255, 255, 0.3)',
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		marginBottom: 12,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		color: '#fff',
	},
	logoImage: {
		width: 120,
		height: 120,
		marginBottom: 14,
	},
	button: {
		height: 48,
		borderRadius: 8,
		backgroundColor: '#f5c842',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 8,
	},
	buttonText: {
		color: '#1e3a8a',
		fontSize: 16,
		fontWeight: '700',
	},
	text: {
		fontSize: 16,
		color: '#fff',
	}
});

export default styles;