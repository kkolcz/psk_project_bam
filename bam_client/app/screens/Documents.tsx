import { Text, View, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import { NavigationProp } from '@react-navigation/native'
import { API_URL_ANDROID, API_URL_WEB } from '@env'
import { useAuth } from '../context/AuthContext'

interface RouterProps {
	navigation: NavigationProp<any, any>
	token: string
}
interface RenderItem {
	item: {
		id: string
		fileName: string
		isShared: string
	}
}

const Documents = ({ navigation }: RouterProps) => {
	const [documents, setDocuments] = useState([])
	const API_URL = Platform.OS === 'android' ? API_URL_ANDROID : API_URL_WEB

	const { token } = useAuth()

	useEffect(() => {
		getFiles(token)
	}, [])

	const getFiles = async (token: string) => {
		console.log(`${API_URL}/files`)
		try {
			const response = await fetch(`${API_URL}/files`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			const data = await response.json()
			console.log(data)
			setDocuments(data)
		} catch (error) {
			console.error('Error fetching documents:', error)
		}
	}

	const getIconName = (fileName: string) => {
		const extension = fileName.split('.').pop()
		switch (extension) {
			case 'pdf':
				return 'file-pdf-o'
			case 'doc':
			case 'docx':
				return 'file-word-o'
			case 'csv':
				return 'file-excel-o'
			default:
				return 'file-o'
		}
	}

	const renderItem = ({ item }: RenderItem) => (
		<View style={styles.itemContainer}>
			<Icon name={getIconName(item.fileName)} size={24} color='#FFFFFF' style={styles.icon} />
			<View style={styles.textContainer}>
				<Text style={styles.documentName}>{item.fileName}</Text>
				<Text style={styles.documentStatus}>{item.isShared}</Text>
			</View>
			<TouchableOpacity
				style={styles.detailsButton}
				onPress={() => navigation.navigate('DocDetails', { document: item })}>
				<Text style={styles.detailsButtonText}>Szczegóły</Text>
			</TouchableOpacity>
		</View>
	)

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Moje dokumenty</Text>
			<FlatList data={documents} renderItem={renderItem} keyExtractor={item => item.id} />
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
	},
	itemContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#ccc',
	},
	icon: {
		marginRight: 10,
	},
	textContainer: {
		flex: 1,
	},
	documentName: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#FFFFFF',
	},
	documentStatus: {
		fontSize: 14,
		color: 'gray',
	},
	detailsButton: {
		backgroundColor: '#42608A',
		padding: 8,
		borderRadius: 5,
	},
	detailsButtonText: {
		color: '#fff',
		fontSize: 14,
	},
})

export default Documents
