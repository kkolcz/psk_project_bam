import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { NavigationProp, RouteProp } from '@react-navigation/native'

interface Document {
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

interface RouterProps {
	navigation: NavigationProp<any, any>
	route: RouteProp<{ params: { document: Document } }, 'params'>
}

const DocDetails = ({ navigation, route }: RouterProps) => {
	const { document } = route.params
	const [isShared, setIsShared] = useState(document.privacy === 'udostępnione')

	const handleShare = () => {
		setIsShared(!isShared)
		console.log(isShared ? 'Przestań udostępniać' : 'Udostępnij')
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
				Nazwa: <Text style={styles.value}>{document.name}</Text>
			</Text>
			<Text style={styles.label}>
				Data: <Text style={styles.value}>{document.date}</Text>
			</Text>
			<Text style={styles.label}>
				Godzina: <Text style={styles.value}>{document.time}</Text>
			</Text>
			<Text style={styles.label}>
				Typ: <Text style={styles.value}>{document.type}</Text>
			</Text>
			<Text style={styles.label}>
				Właściciel: <Text style={styles.value}>{document.owner}</Text>
			</Text>
			<Text style={styles.label}>
				Prywatność: <Text style={styles.value}>{document.privacy}</Text>
			</Text>
			<Text style={styles.label}>
				Weryfikacja: <Text style={styles.value}>{document.verification}</Text>
			</Text>
			<View style={styles.buttonContainer}>
				<TouchableOpacity style={styles.button} onPress={handleShare}>
					<Text style={styles.buttonText}>{isShared ? 'Przestań udostępniać' : 'Udostępnij'}</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
					<Text style={styles.buttonText}>Usuń</Text>
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
	buttonText: {
		color: '#FFFFFF',
		fontSize: 16,
	},
})

export default DocDetails
