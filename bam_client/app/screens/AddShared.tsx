import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'

const AddShared = () => {
	const [code, setCode] = useState('')

	const handleAddDocument = () => {
		console.log('Dodaj dokument z kodem:', code)
	}

	return (
		<View style={styles.container}>
			<View style={styles.inputContainer}>
				<Icon name='key' size={20} color='#000000' style={styles.icon} />
				<TextInput
					style={styles.input}
					placeholder='Wprowadź kod'
					placeholderTextColor='#929292'
					value={code}
					onChangeText={setCode}
				/>
			</View>
			<TouchableOpacity style={styles.button} onPress={handleAddDocument}>
				<Text style={styles.buttonText}>Dodaj</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		padding: 16,
		backgroundColor: '#25293C',
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderColor: 'gray',
		borderWidth: 1,
		marginBottom: 12,
		paddingHorizontal: 8,
		borderRadius: 5,
		backgroundColor: '#FFFFFF',
	},
	icon: {
		marginRight: 10,
	},
	input: {
		flex: 1,
		height: 40,
		color: '#929292',
	},
	button: {
		width: '100%',
		marginTop: 12,
		padding: 10,
		alignItems: 'center',
		borderRadius: 5,
		backgroundColor: '#42608A',
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 16,
	},
})

export default AddShared
