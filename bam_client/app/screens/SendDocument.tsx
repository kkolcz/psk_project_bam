import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native'
import React, { useState } from 'react'
import * as DocumentPicker from 'expo-document-picker'
import { useAuth } from '../context/AuthContext'
import { API_URL_ANDROID, API_URL_WEB } from '@env'

const SendDocument = () => {
	const [title, setTitle] = useState('')
	const { token } = useAuth()
	const API_URL = Platform.OS === 'android' ? API_URL_ANDROID : API_URL_WEB
	const [file, setFile] = useState<any>(null)

	const pickDocument = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: '*/*',
				copyToCacheDirectory: true,
			})

			if (result.canceled) {
				console.log('Wybór pliku anulowany.')
			} else {
				console.log('Wybrano plik:', result.assets[0].uri)
				setFile(result.assets[0])
			}
		} catch (error) {
			console.error('Błąd przy wyborze pliku:', error)
		}
	}

	const handleSendDocument = async () => {
		if (!title || !file) {
			Alert.alert('Błąd', 'Proszę wprowadzić tytuł i wybrać plik.')
			return
		}

		const formData = new FormData()
		// formData.append('title', title)
		const fileBlob = await fetch(file.uri).then(res => res.blob())
		formData.append('file', fileBlob, file.name)

		try {
			const response = await fetch(`${API_URL}/files`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`, // Token autoryzacji
				},
				body: formData,
			})

			if (response.ok) {
				Alert.alert('Sukces', 'Dokument został przesłany.')
			} else {
				const errorData = await response.json()
				Alert.alert('Błąd', errorData.message || 'Wystąpił błąd podczas przesyłania dokumentu.')
			}
		} catch (error) {
			console.error('Error sending document:', error)
			Alert.alert('Błąd', 'Wystąpił błąd podczas przesyłania dokumentu. Spróbuj ponownie.')
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.label}>Tytuł</Text>
			<TextInput style={styles.input} placeholder='Wprowadź tytuł' value={title} onChangeText={setTitle} />
			<TouchableOpacity style={styles.button} onPress={pickDocument}>
				<Text style={styles.buttonText}>Wybierz plik</Text>
			</TouchableOpacity>
			{file && <Text style={styles.fileName}>filename</Text>}
			<TouchableOpacity style={styles.button} onPress={handleSendDocument}>
				<Text style={styles.buttonText}>Wyślij</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#25293C',
	},
	label: {
		fontSize: 16,
		color: '#FFFFFF',
		marginBottom: 8,
	},
	input: {
		height: 40,
		borderColor: 'gray',
		borderWidth: 1,
		marginBottom: 12,
		paddingHorizontal: 8,
		borderRadius: 5,
		backgroundColor: '#FFFFFF',
		color: '#000000',
	},
	button: {
		padding: 10,
		alignItems: 'center',
		borderRadius: 5,
		backgroundColor: '#42608A',
		marginBottom: 12,
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 16,
	},
	fileName: {
		color: '#FFFFFF',
		marginBottom: 12,
	},
})

export default SendDocument
