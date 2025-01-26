import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native'
import React, { useState } from 'react'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { useAuth } from '../context/AuthContext'
import { API_URL_ANDROID, API_URL_WEB } from '@env'
import { NavigationProp } from '@react-navigation/native'

interface RouterProps {
	navigation: NavigationProp<any, any>
}

const SendDocument = ({ navigation }: RouterProps) => {
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

		const fileBase64 = await FileSystem.readAsStringAsync(file.uri, {
			encoding: FileSystem.EncodingType.Base64,
		})

		const fileBlob = await fetch(file.uri).then(res => {
			return res.blob()
		})

		const endpoint = `${API_URL}/files`
		console.log(endpoint)

		const body = {
			fileName: file.name,
			base64Content: fileBase64,
			contentType: fileBlob.type,
		}

		try {
			const response = await fetch(endpoint, {
				method: 'POST',

				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
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
			<Text style={styles.title}>Prześlij dokument</Text>
			<TextInput style={styles.input} placeholder='Wprowadź tytuł' value={title} onChangeText={setTitle} />
			<View style={styles.controls}>
				<View>
					<TouchableOpacity style={styles.button} onPress={pickDocument}>
						<Text style={styles.buttonText}>Wybierz plik</Text>
					</TouchableOpacity>
					{file && <Text style={styles.fileName}>Wybrano plik: {file.name}</Text>}
					<TouchableOpacity style={styles.button} onPress={handleSendDocument}>
						<Text style={styles.buttonText}>Wyślij</Text>
					</TouchableOpacity>
				</View>
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
		padding: 16,
		backgroundColor: '#25293C',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#FFFFFF',
		marginBottom: 16,
		textAlign: 'center',
		marginTop: 50,
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
	backButton: {
		marginBottom: 50,
		height: 70,
		justifyContent: 'center',
		alignItems: 'center',
	},
	controls: {
		flex: 1,
		justifyContent: 'space-between',
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
