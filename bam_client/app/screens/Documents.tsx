import { Text, View, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import { NavigationProp } from '@react-navigation/native'

const dummyDocuments = [
	{
		id: '1',
		title: 'Dokument Klientów',
		name: 'clients.pdf',
		date: '2023-10-01',
		time: '14:30',
		type: 'PDF',
		owner: 'Jan Kowalski',
		privacy: 'prywatne',
		verification: 'zweryfikowany',
	},
	{
		id: '2',
		title: 'Raport',
		name: 'report.docx',
		date: '2023-10-02',
		time: '10:00',
		type: 'DOCX',
		owner: 'Anna Nowak',
		privacy: 'przypisane',
		verification: 'nieweryfikowany',
	},
	{
		id: '3',
		title: 'Faktura',
		name: 'invoice.csv',
		date: '2023-10-03',
		time: '09:00',
		type: 'CSV',
		owner: 'Piotr Wiśniewski',
		privacy: 'udostępnione',
		verification: 'zweryfikowany',
	},
	{
		id: '4',
		title: 'Prezentacja',
		name: 'presentation.pdf',
		date: '2023-10-04',
		time: '11:30',
		type: 'PDF',
		owner: 'Katarzyna Kowalska',
		privacy: 'prywatne',
		verification: 'nieweryfikowany',
	},
]

interface RouterProps {
	navigation: NavigationProp<any, any>
}

interface RenderItem {
	item: {
		id: string
		title: string
		name: string
		date: string
		time: string
		type: string
		owner: string
		privacy: string
		verification: string
	}
}

const Documents = ({ navigation }: RouterProps) => {
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
			<Icon name={getIconName(item.name)} size={24} color='#FFFFFF' style={styles.icon} />
			<View style={styles.textContainer}>
				<Text style={styles.documentName}>{item.name}</Text>
				<Text style={styles.documentStatus}>{item.privacy}</Text>
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
			<FlatList data={dummyDocuments} renderItem={renderItem} keyExtractor={item => item.id} />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#25293C',
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
