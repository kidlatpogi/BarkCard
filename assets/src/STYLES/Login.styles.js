import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		justifyContent: 'center',
		backgroundColor: '#fff',
		alignItems: 'center',
	},
	title: {
		fontSize: 22,
		fontWeight: '600',
		marginBottom: 20,
		textAlign: 'center',
		color: '#222',
	},
	input: {
		height: 48,
		borderColor: '#ddd',
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		marginBottom: 12,
		backgroundColor: '#fafafa',
	},
	logoImage: {
		width: 120,
		height: 120,
		marginBottom: 14,
	},
	button: {
		height: 48,
		borderRadius: 8,
		backgroundColor: '#2f80ed',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 8,
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	text: {
		fontSize: 16,
		color: '#333',
	}
});

export default styles;