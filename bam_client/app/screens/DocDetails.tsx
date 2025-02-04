import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Modal, Clipboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationProp, RouteProp } from '@react-navigation/native'
import * as FileSystem from 'expo-file-system'
import { API_URL_ANDROID, API_URL_WEB } from '@env'
import { useAuth } from '../context/AuthContext'
import { StorageAccessFramework } from 'expo-file-system'

interface RouterProps {
	navigation: NavigationProp<any, any>
	route: RouteProp<{ params: { document: Document; refreshDocuments: () => void } }, 'params'>
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
	const { document, refreshDocuments } = route.params
	const [isShared, setIsShared] = useState(document.isShared ? true : false)
	const { token } = useAuth()
	const [modalVisible, setModalVisible] = useState(false)
	const [accessCode, setAccessCode] = useState('')

	useEffect(() => {}, [])

	const handleShare = async () => {
		setIsShared(!isShared)

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
				setAccessCode(data.accessCode)
				setModalVisible(true)
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

				await FileSystem.writeAsStringAsync(fileUri, data.base64Content, {
					encoding: FileSystem.EncodingType.Base64,
				})

				const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync()
				if (!permissions.granted) {
					return
				}

				try {
					await StorageAccessFramework.createFileAsync(permissions.directoryUri, data.fileName, data.contentType)
						.then(async uri => {
							await FileSystem.writeAsStringAsync(uri, data.base64Content, { encoding: FileSystem.EncodingType.Base64 })
							Alert.alert('Sukces', 'Plik został pomyślnie pobrany.')
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

	const handleDelete = () => {
		Alert.alert(
			'Potwierdzenie usunięcia',
			'Czy na pewno chcesz usunąć ten plik?',
			[
				{
					text: 'Nie',
					style: 'cancel',
				},
				{
					text: 'Tak',
					onPress: async () => {
						try {
							const response = await fetch(`${API_URL}/files/${document.id}`, {
								method: 'DELETE',
								headers: {
									Authorization: `Bearer ${token}`,
								},
							})

							if (response.ok) {
								Alert.alert('Sukces', 'Plik został usunięty.')
								refreshDocuments()
								navigation.goBack()
							} else {
								const errorData = await response.json()
								Alert.alert('Błąd', errorData.message || 'Wystąpił błąd podczas usuwania pliku.')
							}
						} catch (error) {
							console.error('Error deleting document:', error)
							Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania pliku. Spróbuj ponownie.')
						}
					},
				},
			],
			{ cancelable: false }
		)
	}

	const handleGoBack = () => {
		navigation.goBack()
	}

	const copyToClipboard = () => {
		Clipboard.setString(accessCode)
		Alert.alert('Skopiowano', 'Kod został skopiowany do schowka.')
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Szczegóły dokumentu</Text>
			<Text style={styles.label}>
				Tytuł: <Text style={styles.value}>{document.title || 'Faktura za zakupy'}</Text>
			</Text>
			<Text style={styles.label}>
				Nazwa: <Text style={styles.value}>{document.fileName}</Text>
			</Text>
			<Text style={styles.label}>
				Właściciel: <Text style={styles.value}>Jan Kowalski</Text>
			</Text>
			<Text style={styles.label}>
				Typ pliku: <Text style={styles.value}>{document.fileName.split('.').pop()}</Text>
			</Text>
			<Text style={styles.label}>
				Data: <Text style={styles.value}>{document.isShared || '10.12.2024'}</Text>
			</Text>
			<View style={styles.controls}>
				<View>
					<View style={styles.buttonContainer}>
						<TouchableOpacity style={styles.button} onPress={handleShare}>
							<Text style={styles.buttonText}>{isShared ? 'Przestań udostępniać' : 'Udostępnij'}</Text>
						</TouchableOpacity>
						<TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
							<Text style={styles.buttonText}>Usuń</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.buttonContainer}>
						<TouchableOpacity style={[styles.button, styles.downloadButton]} onPress={handleDownload}>
							<Text style={styles.buttonText}>Pobierz</Text>
						</TouchableOpacity>
					</View>
				</View>
				<View>
					<View style={styles.buttonContainer}>
						<TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleGoBack}>
							<Text style={styles.buttonText}>Powrót</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>

			<Modal
				animationType='slide'
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => {
					setModalVisible(!modalVisible)
				}}>
				<View style={styles.modalContainer}>
					<View style={styles.modalView}>
						<Text style={styles.modalText}>Kod udostępnienia:</Text>
						<Text style={styles.accessCode}>{accessCode}</Text>
						<TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
							<Text style={styles.buttonText}>Kopiuj</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.copyButton, styles.closeButton]}
							onPress={() => setModalVisible(!modalVisible)}>
							<Text style={styles.buttonText}>Zamknij</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
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
	controls: {
		flex: 1,
		justifyContent: 'space-between',
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
	downloadButton: {},
	backButton: {
		justifyContent: 'center',
		alignItems: 'center',
		padding: 10,
		marginBlock: 50,
		height: 70,
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 16,
	},
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalView: {
		width: '80%',
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 20,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalText: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	accessCode: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
	},
	copyButton: {
		backgroundColor: '#42608A',
		padding: 10,
		borderRadius: 5,
		marginBottom: 10,
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	closeButton: {
		padding: 10,
		borderRadius: 5,
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 50,
	},
})

export default DocDetails
