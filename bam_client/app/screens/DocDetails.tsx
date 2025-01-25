import { View, Text, Button, StyleSheet, TouchableOpacity, Alert, Platform, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationProp, RouteProp } from '@react-navigation/native'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import { API_URL_ANDROID, API_URL_WEB } from '@env'
import { useAuth } from '../context/AuthContext'
import { StorageAccessFramework } from 'expo-file-system'

interface RenderItem {
	item: {
		id: string
		fileName: string
		isShared: string
	}
}

interface RouterProps {
	navigation: NavigationProp<any, any>
	route: RouteProp<{ params: { document: Document } }, 'params'>
}

interface Document {
	id: number
	title: string
	fileName: string
	isShared: string
}

interface IDownloadResponse {
	fileName: string
	contentType: string
	base64Content: string
}

const DocDetails = ({ navigation, route }: RouterProps) => {
	const API_URL = Platform.OS === 'android' ? API_URL_ANDROID : API_URL_WEB
	const { document } = route.params
	const [isShared, setIsShared] = useState(document.isShared ? true : false)
	const [link, setLink] = useState('')
	const { token } = useAuth()

	useEffect(() => {
		console.log(document.isShared)
		console.log(isShared)
	}, [])

	const handleShare = async () => {
		setIsShared(!isShared)
		console.log(isShared ? 'Przestań udostępniać' : 'Udostępnij')

		try {
			const response = await fetch(`${API_URL}/files/share/${document.id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({}),
			})

			if (response.ok) {
				const data = await response.json()
				Alert.alert('Sukces', `Dokument został udostępniony. Access Code: ${data.accessCode}`)
			} else {
				const errorData = await response.json()
				Alert.alert('Błąd', errorData.message || 'Wystąpił błąd podczas udostępniania dokumentu.')
			}
		} catch (error) {
			console.error('Error sharing document:', error)
			Alert.alert('Błąd', 'Wystąpił błąd podczas udostępniania dokumentu. Spróbuj ponownie.')
		}
	}

	const handleDownload = async () => {
		const uri = `${API_URL}/files/download-base64/${document.id}`
		console.log('Download URI:', uri)

		try {
			const response = await fetch(`${uri}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			})

			const data: IDownloadResponse = await response.json()
			if (data && data.base64Content) {
				const fileUri = `${FileSystem.cacheDirectory}${data.fileName}`

				console.log('File saved at:', fileUri)
				const fileInfo = await FileSystem.getInfoAsync(fileUri)
				console.log('File info:', fileInfo)

				await FileSystem.writeAsStringAsync(fileUri, data.base64Content, {
					encoding: FileSystem.EncodingType.Base64,
				})

				// const { status } = await MediaLibrary.requestPermissionsAsync()

				const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync()
				if (!permissions.granted) {
					return
				}

				try {
					await StorageAccessFramework.createFileAsync(permissions.directoryUri, data.fileName, data.contentType)
						.then(async uri => {
							await FileSystem.writeAsStringAsync(uri, data.base64Content, { encoding: FileSystem.EncodingType.Base64 })
						})
						.catch(e => {
							console.log(e)
						})
				} catch (e: any) {
					console.log(e)
				}
			}
		} catch (error) {
			console.error('Error Downloading:', error)
			Alert.alert('Błąd', 'Nie udało się pobrać pliku.')
		}
	}

	const saveBase64File = async (base64Data: string, fileName: string) => {
		const uri = FileSystem.documentDirectory + fileName

		try {
			// Zapisanie pliku
			await FileSystem.writeAsStringAsync(uri, base64Data, {
				encoding: FileSystem.EncodingType.Base64,
			})
			console.log(`Plik zapisany pod ścieżką: ${uri}`)
		} catch (error) {
			console.error('Błąd podczas zapisywania pliku:', error)
		}
	}

	const handleDelete = () => {
		console.log('Usuń dokument')
		navigation.goBack()
	}

	return (
		<View style={styles.container}>
			<Text style={styles.label}>
				Tytuł: <Text style={styles.value}>{document.title}</Text>
			</Text>
			<Text style={styles.label}>
				Nazwa: <Text style={styles.value}>{document.fileName}</Text>
			</Text>
			<Text style={styles.label}>
				Typ pliku: <Text style={styles.value}>{document.fileName.split('.').pop()}</Text>
			</Text>
			<Text style={styles.label}>
				Data: <Text style={styles.value}>{document.isShared}</Text>
			</Text>
			<View style={styles.buttonContainer}>
				<TouchableOpacity style={styles.button} onPress={handleShare}>
					<Text style={styles.buttonText}>{isShared ? 'Przestań udostępniać' : 'Udostępnij'}</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
					<Text style={styles.buttonText}>Usuń</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.button, styles.downloadButton]} onPress={handleDownload}>
					<Text style={styles.buttonText}>Pobierz</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.button, styles.downloadButton]} onPress={handleDownload}>
					<Text style={styles.buttonText}>{link}</Text>
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
	label: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 8,
		color: '#FFFFFF',
	},
	value: {
		fontWeight: 'normal',
		color: '#FFFFFF',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 20,
	},
	button: {
		flex: 1,
		marginHorizontal: 5,
		padding: 10,
		alignItems: 'center',
		borderRadius: 5,
		backgroundColor: '#42608A',
	},
	deleteButton: {
		backgroundColor: 'red',
	},
	downloadButton: {
		backgroundColor: 'red',
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 16,
	},
})

export default DocDetails
