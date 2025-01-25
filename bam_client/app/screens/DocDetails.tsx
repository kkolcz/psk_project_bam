import { View, Text, Button, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationProp, RouteProp } from '@react-navigation/native'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import { API_URL_ANDROID, API_URL_WEB } from '@env'

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

const DocDetails = ({ navigation, route }: RouterProps) => {
	const API_URL = Platform.OS === 'android' ? API_URL_ANDROID : API_URL_WEB
	const { document } = route.params
	const [isShared, setIsShared] = useState(document.isShared ? true : false)
	const [link, setLink] = useState('')

	useEffect(() => {
		console.log(document.isShared)
		console.log(isShared)
	}, [])

	const handleShare = () => {
		setIsShared(!isShared)
		console.log(isShared ? 'Przestań udostępniać' : 'Udostępnij')
	}

	const handleDownload = async () => {
		const uri = `${API_URL}'/files/download/'${document.id}`
		if (Platform.OS === 'web') {
			setLink(uri)
			Alert.alert('Pobieranie zakończone', `Plik został pobrany: ${document.fileName}`)
		} else {
			try {
				const { status } = await MediaLibrary.requestPermissionsAsync()
				if (status !== 'granted') {
					Alert.alert('Permission denied', 'Permission to access media library is required!')
					return
				}

				const fileUri = `${FileSystem.documentDirectory}${document.fileName}`
				const { uri: downloadedUri } = await FileSystem.downloadAsync(uri, fileUri)

				const asset = await MediaLibrary.createAssetAsync(downloadedUri)
				await MediaLibrary.createAlbumAsync('Download', asset, false)
				Alert.alert('Pobieranie zakończone', `Plik został pobrany do katalogu Download: ${asset.uri}`)
			} catch (error) {
				console.error('Error downloading file:', error)
				Alert.alert('Błąd pobierania', 'Wystąpił błąd podczas pobierania pliku. Spróbuj ponownie.')
			}
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
