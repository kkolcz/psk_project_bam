import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useAuth } from '../context/AuthContext'
import { API_URL_ANDROID, API_URL_WEB } from '@env'
import { NavigationProp } from '@react-navigation/native'

interface RouterProps {
	navigation: NavigationProp<any, any>
}

const AddShared = ({ navigation }: RouterProps) => {
	const [code, setCode] = useState('')

	const { token } = useAuth()
	const API_URL = Platform.OS === 'android' ? API_URL_ANDROID : API_URL_WEB

	const handleAddDocument = async () => {
		// console.log('Dodaj dokument z kodem:', code)
		try {
			const response = await fetch(`${API_URL}/files/shared/${code}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			})

			if (response.ok) {
				Alert.alert('Sukces', 'Dokument został dodany.')
			} else {
				const errorData = await response.json()
				Alert.alert('Błąd', errorData.message || 'Wystąpił błąd podczas dodawania dokumentu.')
			}
		} catch (error) {
			console.error('Error adding document:', error)
			Alert.alert('Błąd', 'Wystąpił błąd podczas dodawania dokumentu. Spróbuj ponownie.')
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Dodaj udostępniony dokument</Text>
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
			<View style={styles.controls}>
				<TouchableOpacity style={styles.button} onPress={handleAddDocument}>
					<Text style={styles.buttonText}>Dodaj</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => navigation.goBack()}>
					<Text style={styles.buttonText}>Powrót</Text>
				</TouchableOpacity>
			</View>
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
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#FFFFFF',
		marginBottom: 16,
		textAlign: 'center',
		marginTop: 50,
	},
	controls: {
		flex: 1,
		justifyContent: 'space-between',
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
	backButton: {
		marginBottom: 50,
		height: 70,
		justifyContent: 'center',
		alignItems: 'center',
	},
})

export default AddShared
